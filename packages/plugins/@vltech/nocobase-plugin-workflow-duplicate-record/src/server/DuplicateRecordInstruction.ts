import { Processor, Instruction, JOB_STATUS, FlowNodeModel } from '@nocobase/plugin-workflow';
import { Model, Collection } from '@nocobase/database';

/**
 * Configuration interface for duplicate record node
 */
export interface DuplicateRecordConfig {
  /**
   * Collection to duplicate record from
   */
  collection: string;

  /**
   * Source record ID or variable reference
   */
  sourceRecordId?: any;

  /**
   * Fields to override with custom values
   * Format: [{ field: 'fieldName', value: 'newValue' }]
   */
  overrideFields?: Array<{
    field: string;
    value: any;
  }>;

  /**
   * Continue workflow even if duplication fails
   */
  ignoreFail?: boolean;
}

/**
 * Server-side instruction for duplicating records
 */
export default class DuplicateRecordInstruction extends Instruction {
  constructor(workflow: any) {
    super(workflow);
  }
  /**
   * Internal NocoBase fields that should not be duplicated
   */
  private readonly INTERNAL_FIELDS = [
    'id',
    'createdAt',
    'updatedAt',
    'createdById',
    'updatedById',
    'createdBy',
    'updatedBy',
    '__v',
    'sort',
  ];

  /**
   * Main execution method
   */
  async run(node: FlowNodeModel, prevJob: any, processor: Processor) {
    const config = processor.getParsedValue(node.config, node.id) as DuplicateRecordConfig;

    try {
      processor.logger.info(
        `duplicate-record (#${node.id}) starting for collection: ${config.collection}`,
      );

      // Validate configuration
      if (!config.collection) {
        throw new Error('Collection is required');
      }

      // Get the collection
      const collection = this.workflow.app.db.getCollection(config.collection);
      if (!collection) {
        throw new Error(`Collection "${config.collection}" not found`);
      }

      // Get source record ID from config or previous job result
      let sourceRecordId = config.sourceRecordId;
      if (!sourceRecordId && prevJob?.result?.id) {
        sourceRecordId = prevJob.result.id;
      }

      if (!sourceRecordId) {
        throw new Error('Source record ID is required');
      }

      processor.logger.debug(
        `duplicate-record (#${node.id}) fetching source record with ID: ${sourceRecordId}`,
      );

      // Fetch the source record (no need to load relations)
      const sourceRecord = await collection.repository.findOne({
        filterByTk: sourceRecordId,
      });

      if (!sourceRecord) {
        throw new Error(`Source record with ID "${sourceRecordId}" not found in collection "${config.collection}"`);
      }

      processor.logger.debug(
        `duplicate-record (#${node.id}) duplicating record...`,
      );

      // Duplicate the record
      const duplicatedRecord = await this.duplicateRecord(
        collection,
        sourceRecord,
        config,
        processor,
      );

      processor.logger.info(
        `duplicate-record (#${node.id}) completed successfully. New record ID: ${duplicatedRecord.id}`,
      );

      return {
        status: JOB_STATUS.RESOLVED,
        result: duplicatedRecord.toJSON(),
      };
    } catch (error) {
      const err = error as Error;
      processor.logger.error(
        `duplicate-record (#${node.id}) failed: ${err.message}`,
        err.stack,
      );

      if (config.ignoreFail) {
        return {
          status: JOB_STATUS.RESOLVED,
          result: {
            error: err.message,
            stack: err.stack,
          },
        };
      }

      return {
        status: JOB_STATUS.FAILED,
        result: {
          error: err.message,
          stack: err.stack,
        },
      };
    }
  }

  /**
   * Duplicate a record with all its fields and relations
   */
  private async duplicateRecord(
    collection: Collection<any, any>,
    sourceRecord: Model,
    config: DuplicateRecordConfig,
    processor: Processor,
  ): Promise<Model> {
    const sourceData = sourceRecord.toJSON();
    const newRecordData: any = {};

    // Copy all fields except internal ones
    for (const [key, value] of Object.entries(sourceData)) {
      if (this.shouldCopyField(key, collection)) {
        newRecordData[key] = value;
      }
    }

    // Apply field overrides
    if (config.overrideFields && config.overrideFields.length > 0) {
      for (const override of config.overrideFields) {
        if (override.field && override.field !== 'id') {
          newRecordData[override.field] = override.value;
          processor.logger.debug(
            `Overriding field "${override.field}" with value: ${JSON.stringify(override.value)}`,
          );
        }
      }
    }

    // Create the new record
    const newRecord = await collection.repository.create({
      values: newRecordData,
    });

    processor.logger.debug(
      `Created new record with ID: ${newRecord.id}. BelongsTo relations copied via foreign keys.`,
    );

    return newRecord;
  }

  /**
   * Check if a field should be copied
   * Note: Foreign keys from belongsTo relations will be copied automatically
   * since they are regular fields (integer, string, etc.)
   */
  private shouldCopyField(fieldName: string, collection: any): boolean {
    // Skip internal fields
    if (this.INTERNAL_FIELDS.includes(fieldName)) {
      return false;
    }

    // Get field definition from collection
    const field = collection.getField(fieldName);

    // Skip if field doesn't exist in schema
    if (!field) {
      return false;
    }

    // Skip relation fields themselves (not their foreign keys)
    // belongsTo foreign keys are regular fields and will be copied
    if (field.type === 'belongsTo' || field.type === 'hasOne' || field.type === 'hasMany' || field.type === 'belongsToMany') {
      return false;
    }

    return true;
  }

  /**
   * Resume method - called when workflow resumes from this node
   */
  async resume(node: FlowNodeModel, job: any, processor: Processor) {
    const { ignoreFail } = node.config as DuplicateRecordConfig;

    if (ignoreFail && job.status === JOB_STATUS.FAILED) {
      job.set('status', JOB_STATUS.RESOLVED);
    }

    return job;
  }
}
