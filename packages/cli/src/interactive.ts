import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  executeCommit,
  getRepoInfo,
  logCommit,
  CommitMessage,
  ConfigOptions,
  ConventionalCommitType,
  ParsedDiff,
} from '@conventionalize/core';

export async function startInteractiveCommit(
  diff: ParsedDiff,
  initialCommit: CommitMessage,
  config: ConfigOptions
): Promise<void> {
  console.log('\n' + chalk.bold.cyan('conventionalize') + '\n');

  console.log(chalk.gray(`Staged files (${diff.changedFilesCount}):`));
  diff.files.forEach((f) => {
    const color = f.status === 'added' ? chalk.green : f.status === 'deleted' ? chalk.red : chalk.yellow;
    console.log(`  ${color(f.status.padEnd(8))} ${f.filename} (+${f.additions}/-${f.deletions})`);
  });
  console.log('');

  console.log(chalk.bold('Suggested Commit Message:'));
  console.log(chalk.green(`  ${initialCommit.formatted}`));
  if (initialCommit.body) {
    console.log(chalk.gray(`\n  Body:\n  ${initialCommit.body.split('\n').join('\n  ')}`));
  }
  console.log('');

  let currentCommit = { ...initialCommit };

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Action:',
        choices: [
          { name: 'Commit change (git commit -m ...)', value: 'commit' },
          { name: 'Edit header (type, scope, description)', value: 'edit' },
          { name: 'Print commit text', value: 'copy' },
          { name: 'Cancel', value: 'cancel' },
        ],
      },
    ]);

    if (action === 'cancel') {
      console.log(chalk.yellow('Cancelled. Staged files left unchanged.'));
      process.exit(0);
    }

    if (action === 'edit') {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Select commit type:',
          default: currentCommit.type,
          choices: [
            { name: 'feat:     A new feature', value: 'feat' },
            { name: 'fix:      A bug fix', value: 'fix' },
            { name: 'docs:     Documentation only changes', value: 'docs' },
            { name: 'style:    Changes that do not affect the meaning of the code', value: 'style' },
            { name: 'refactor: A code change that neither fixes a bug nor adds a feature', value: 'refactor' },
            { name: 'perf:     A code change that improves performance', value: 'perf' },
            { name: 'test:     Adding missing tests or correcting existing tests', value: 'test' },
            { name: 'build:    Changes that affect the build system or external dependencies', value: 'build' },
            { name: 'ci:       Changes to CI configuration files and scripts', value: 'ci' },
            { name: 'chore:    Other changes that don\'t modify src or test files', value: 'chore' },
          ],
        },
        {
          type: 'input',
          name: 'scope',
          message: 'Scope (optional, leave empty for none):',
          default: currentCommit.scope || '',
        },
        {
          type: 'input',
          name: 'subject',
          message: 'Commit description:',
          default: currentCommit.subject,
        },
        {
          type: 'confirm',
          name: 'isBreaking',
          message: 'Is this a BREAKING CHANGE?',
          default: currentCommit.isBreaking,
        },
      ]);

      const formattedScope = answers.scope.trim() ? `(${answers.scope.trim()})` : '';
      const breakingBang = answers.isBreaking ? '!' : '';
      const formatted = `${answers.type}${formattedScope}${breakingBang}: ${answers.subject.trim()}`;

      currentCommit = {
        type: answers.type as ConventionalCommitType,
        scope: answers.scope.trim() || undefined,
        isBreaking: answers.isBreaking,
        subject: answers.subject.trim(),
        formatted,
        body: currentCommit.body,
      };

      console.log('\nUpdated Commit:');
      console.log(chalk.green(`  ${currentCommit.formatted}\n`));
      continue;
    }

    if (action === 'copy') {
      console.log('\n' + chalk.bold('Formatted Commit Message:'));
      console.log(chalk.cyan(currentCommit.formatted));
      if (currentCommit.body) {
        console.log(chalk.gray(`\n${currentCommit.body}`));
      }
      console.log('');
      continue;
    }

    if (action === 'commit') {
      let finalMessage = currentCommit.formatted;
      if (config.includeBody && currentCommit.body) {
        finalMessage += `\n\n${currentCommit.body}`;
      }

      console.log(chalk.gray('\nExecuting git commit...'));
      executeCommit(finalMessage);

      const repoInfo = getRepoInfo();
      logCommit(
        currentCommit,
        repoInfo.name,
        repoInfo.path,
        diff.changedFilesCount,
        diff.totalAdditions,
        diff.totalDeletions
      );

      console.log(chalk.bold.green('✔ Successfully committed changes!'));
      process.exit(0);
    }
  }
}
