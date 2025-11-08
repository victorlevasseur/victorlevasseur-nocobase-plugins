import { Plugin } from '@nocobase/server';
import WorkflowPlugin from '@nocobase/plugin-workflow';
import DuplicateRecordInstruction from './DuplicateRecordInstruction';

export default class PluginWorkflowDuplicateRecord extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    const workflowPlugin = this.pm.get<WorkflowPlugin>(WorkflowPlugin);

    if (!workflowPlugin) {
      throw new Error('Workflow plugin is required for duplicate-record plugin');
    }

    workflowPlugin.registerInstruction('duplicate-record', DuplicateRecordInstruction);

    this.app.logger.info('Workflow duplicate-record plugin loaded');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}
