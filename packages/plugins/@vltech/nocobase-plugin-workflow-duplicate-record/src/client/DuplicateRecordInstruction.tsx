import React from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { ArrayItems } from '@formily/antd-v5';
import {
  Instruction,
  WorkflowVariableInput,
  WorkflowVariableTextArea,
  defaultFieldNames,
  useWorkflowVariableOptions,
} from '@nocobase/plugin-workflow/client';
import { useCollectionManager } from '@nocobase/client';

/**
 * Client-side instruction component for the duplicate record node.
 */
export default class DuplicateRecordInstruction extends Instruction {
  type = 'duplicate-record';

  title = 'Duplicate Record';

  description = 'Duplicate a record from a collection with all its fields and belongsTo relations';

  group = 'collection';

  icon = <CopyOutlined />;

  color = '#52c41a';

  fieldset = {
    collection: {
      type: 'string',
      required: true,
      title: 'Collection',
      'x-decorator': 'FormItem',
      'x-component': 'CollectionSelect',
      'x-component-props': {
        className: 'auto-width',
      },
    },

    sourceRecordId: {
      type: 'string',
      title: 'Source Record ID',
      description: 'ID of the record to duplicate (uses previous node result if empty)',
      'x-decorator': 'FormItem',
      'x-component': 'WorkflowVariableInput',
      'x-component-props': {
        useTypedConstant: ['number', 'string'],
        className: 'auto-width',
      },
    },

    overrideFields: {
      type: 'array',
      title: 'Override Fields',
      description: 'Fields to override with custom values instead of duplicating',
      'x-decorator': 'FormItem',
      'x-component': 'ArrayItems',
      items: {
        type: 'object',
        properties: {
          space: {
            type: 'void',
            'x-component': 'Space',
            properties: {
              field: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'FieldSelect',
                'x-component-props': {
                  placeholder: 'Field name',
                  className: 'auto-width',
                },
                required: true,
              },
              value: {
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': 'WorkflowVariableTextArea',
                'x-component-props': {
                  placeholder: 'New value',
                  useTypedConstant: true,
                  className: 'auto-width',
                },
              },
              remove: {
                type: 'void',
                'x-decorator': 'FormItem',
                'x-component': 'ArrayItems.Remove',
              },
            },
          },
        },
      },
      properties: {
        add: {
          type: 'void',
          title: 'Add Field Override',
          'x-component': 'ArrayItems.Addition',
        },
      },
      'x-reactions': [
        {
          dependencies: ['.collection'],
          fulfill: {
            state: {
              visible: '{{!!$deps[0]}}',
            },
          },
        },
      ],
    },

    ignoreFail: {
      type: 'boolean',
      title: 'Continue on error',
      description: 'Continue workflow execution even if duplication fails',
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: false,
    },
  };

  components = {
    ArrayItems,
    WorkflowVariableInput,
    WorkflowVariableTextArea,
    FieldSelect,
  };

  /**
   * Define variables that downstream nodes can access
   */
  useVariables({ key, title, config }: any, { types }: any) {
    // If no collection selected, return basic structure
    if (!config?.collection) {
      return {
        [defaultFieldNames.value]: key,
        [defaultFieldNames.label]: title,
      };
    }

    return {
      [defaultFieldNames.value]: key,
      [defaultFieldNames.label]: title,
      [defaultFieldNames.children]: [
        {
          [defaultFieldNames.value]: 'id',
          [defaultFieldNames.label]: 'ID',
        },
        {
          [defaultFieldNames.value]: 'createdAt',
          [defaultFieldNames.label]: 'Created At',
        },
        {
          [defaultFieldNames.value]: 'updatedAt',
          [defaultFieldNames.label]: 'Updated At',
        },
      ],
    };
  }

  useInitializers(node: any): any {
    return null;
  }
}

/**
 * Custom component for collection select
 */
function CollectionSelect(props: any) {
  const { value, onChange, ...rest } = props;
  const cm = useCollectionManager();
  const collections = cm?.getCollections?.() || [];

  const options = collections
    .filter((collection: any) => !collection.isThrough && !collection.hidden)
    .map((collection: any) => ({
      label: collection.title || collection.name,
      value: collection.name,
    }));

  return (
    <select
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      {...rest}
      style={{ width: '100%', padding: '4px 11px', borderRadius: '6px', border: '1px solid #d9d9d9' }}
    >
      <option value="">Select a collection</option>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Custom component for field select
 */
function FieldSelect(props: any) {
  const { value, onChange, placeholder, ...rest } = props;

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
      style={{ width: '200px', padding: '4px 11px', borderRadius: '6px', border: '1px solid #d9d9d9' }}
    />
  );
}
