#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { getStagedDiff, isGitRepository, getUnstagedDiff } from '../core/git.js';
import { generateCommitMessage } from '../core/ai.js';
import { loadConfig } from '../core/config.js';
import { startInteractiveCommit } from './interactive.js';
import { handleConfigCommand } from './commands/config.js';
import { handleLicenseCommand } from './commands/license.js';
import { handleHistoryCommand, handleStatsCommand } from './commands/history.js';
import { handleHookCommand } from './commands/hook.js';
import { handleCompletionCommand } from './commands/completion.js';

const program = new Command();

program
  .name('conventionalize')
  .alias('gcai')
  .description('Conventionalize – Diff to Conventional Commit Builder CLI')
  .version('1.0.0');

program
  .option('-r, --raw', 'Output formatted commit message directly to stdout without interactive prompt')
  .option('-u, --all-unstaged', 'Include unstaged changes if no staged changes exist')
  .option('-d, --debug', 'Print verbose debug logs and heuristic scoring details')
  .action(async (options) => {
    try {
      const startTime = Date.now();

      if (!isGitRepository()) {
        console.error(chalk.red('Error: Not inside a git repository.'));
        process.exit(1);
      }

      const config = loadConfig();
      if (options.debug) {
        config.debug = true;
      }

      let diff = getStagedDiff();

      if (diff.changedFilesCount === 0 && options.allUnstaged) {
        diff = getUnstagedDiff();
      }

      if (diff.changedFilesCount === 0) {
        console.log(chalk.yellow('No staged changes found. Use `git add <files>` to stage changes.'));
        console.log(chalk.gray('Tip: Run `conventionalize -u` to scan unstaged changes.'));
        process.exit(0);
      }

      if (config.debug) {
        console.log(chalk.cyan('\n[debug telemetry]'));
        console.log(`  Changed files: ${diff.changedFilesCount}`);
        console.log(`  Total additions: +${diff.totalAdditions}`);
        console.log(`  Total deletions: -${diff.totalDeletions}`);
        console.log(`  Raw patch length: ${diff.rawDiff.length} chars`);
        console.log(`  Provider: ${config.provider}`);
        if (config.ticketPrefix) {
          console.log(`  Ticket prefix: ${config.ticketPrefix}`);
        }
      }

      const commitMessage = await generateCommitMessage(diff, config);

      if (config.debug) {
        console.log(`  Analysis latency: ${Date.now() - startTime}ms`);
        console.log(`  Inferred type: ${commitMessage.type}`);
        console.log(`  Inferred scope: ${commitMessage.scope || 'none'}`);
        console.log(chalk.cyan('[end telemetry]\n'));
      }

      if (options.raw) {
        process.stdout.write(commitMessage.formatted);
        process.exit(0);
      }

      await startInteractiveCommit(diff, commitMessage, config);
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure API keys, AI model, default scope, ticket prefix, and settings')
  .option('-l, --list', 'List current settings')
  .action(handleConfigCommand);

program
  .command('license [key]')
  .description('Activate or view Pro License status')
  .action(handleLicenseCommand);

program
  .command('history')
  .description('View commit history log across repositories')
  .option('-e, --export [filename]', 'Export history to Markdown changelog format')
  .action(handleHistoryCommand);

program
  .command('stats')
  .description('View commit analytics and type breakdown')
  .action(handleStatsCommand);

program
  .command('hook <action>')
  .description('Install or uninstall Git prepare-commit-msg hook (install/uninstall)')
  .action(handleHookCommand);

program
  .command('completion [shell]')
  .description('Generate shell autocompletion script (zsh or bash)')
  .action(handleCompletionCommand);

program.parse(process.argv);
