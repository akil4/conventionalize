import chalk from 'chalk';
import inquirer from 'inquirer';
import { getConfigPath, loadConfig, saveConfig } from '../../core/config.js';

export async function handleConfigCommand(options: any): Promise<void> {
  const currentConfig = loadConfig();

  if (options.list) {
    console.log(chalk.cyan('\nConfiguration') + ` (${getConfigPath()}):\n`);
    console.log(JSON.stringify(currentConfig, null, 2));
    return;
  }

  console.log(chalk.cyan('\nConfigure Conventionalize Settings\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select Commit Generation Provider:',
      default: currentConfig.provider,
      choices: [
        { name: 'Heuristic Rule Engine (Fast, local, offline)', value: 'heuristic' },
        { name: 'Google Gemini API (Gemini 3.7 Flash / 3.1 Pro / 3.5 Flash-Lite)', value: 'gemini' },
        { name: 'OpenAI API (GPT-4o / GPT-4o-mini / o3-mini)', value: 'openai' },
      ],
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter API Key:',
      default: currentConfig.apiKey || '',
      when: (ans: any) => ans.provider !== 'heuristic',
    },
    {
      type: 'list',
      name: 'model',
      message: 'Select AI Model:',
      default: (ans: any) =>
        currentConfig.model || (ans.provider === 'gemini' ? 'gemini-3.7-flash' : 'gpt-4o-mini'),
      choices: (ans: any) =>
        ans.provider === 'gemini'
          ? [
              { name: 'Gemini 3.7 Flash (Recommended - Fastest & Most Accurate)', value: 'gemini-3.7-flash' },
              { name: 'Gemini 3.5 Flash-Lite (Ultra Lightweight & Low Latency)', value: 'gemini-3.5-flash-lite' },
              { name: 'Gemini 3.1 Pro (Deep Reasoning & Analysis)', value: 'gemini-3.1-pro' },
              { name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
            ]
          : [
              { name: 'GPT-4o Mini (Recommended - Fast & Cheap)', value: 'gpt-4o-mini' },
              { name: 'GPT-4o (High Accuracy)', value: 'gpt-4o' },
              { name: 'GPT-4.5 Preview', value: 'gpt-4.5-preview' },
              { name: 'o3-Mini (Reasoning Model)', value: 'o3-mini' },
            ],
      when: (ans: any) => ans.provider !== 'heuristic',
    },
    {
      type: 'input',
      name: 'defaultScope',
      message: 'Default Commit Scope (optional, e.g. "cli" or "core"):',
      default: currentConfig.defaultScope || '',
    },
    {
      type: 'input',
      name: 'ticketPrefix',
      message: 'Ticket Prefix (optional, e.g. "PROJ-123"):',
      default: currentConfig.ticketPrefix || '',
    },
    {
      type: 'confirm',
      name: 'autoCopy',
      message: 'Automatically copy commit message to clipboard on generate?',
      default: currentConfig.autoCopy,
    },
  ]);

  saveConfig({
    provider: answers.provider,
    apiKey: answers.apiKey || undefined,
    model: answers.model || (answers.provider === 'gemini' ? 'gemini-3.7-flash' : 'gpt-4o-mini'),
    defaultScope: answers.defaultScope || undefined,
    ticketPrefix: answers.ticketPrefix || undefined,
    autoCopy: answers.autoCopy,
  });

  console.log(chalk.green('\nConfiguration updated successfully.'));
}
