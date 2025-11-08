import { Plugin } from '@nocobase/client';
import WorkflowPlugin from '@nocobase/plugin-workflow/client';
import DuplicateRecordInstruction from './DuplicateRecordInstruction';
import enUS from '../locale/en-US.json';
import frFR from '../locale/fr-FR.json';

export default class PluginWorkflowDuplicateRecordClient extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    // Load translations from JSON files
    this.app.i18n.addResources('en-US', 'workflow-duplicate-record', enUS);
    this.app.i18n.addResources('fr-FR', 'workflow-duplicate-record', frFR);

    const workflow = this.app.pm.get('workflow') as WorkflowPlugin;

    if (!workflow) {
      console.error('Workflow plugin is required for duplicate-record plugin');
      return;
    }

    workflow.registerInstruction('duplicate-record', DuplicateRecordInstruction);
  }
}

