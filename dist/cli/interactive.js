import chalk from 'chalk';
import inquirer from 'inquirer';
import { executeCommit, getRepoInfo } from '../core/git.js';
import { logCommit } from '../core/history.js';
export async function startInteractiveCommit(diff, initialCommit, config) {
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
                    message: 'Commit type:',
                    default: currentCommit.type,
                    choices: [
                        'feat',
                        'fix',
                        'docs',
                        'style',
                        'refactor',
                        'perf',
                        'test',
                        'build',
                        'ci',
                        'chore',
                        'revert',
                    ],
                },
                {
                    type: 'input',
                    name: 'scope',
                    message: 'Scope (optional):',
                    default: currentCommit.scope || '',
                },
                {
                    type: 'input',
                    name: 'subject',
                    message: 'Description:',
                    default: currentCommit.subject,
                },
                {
                    type: 'confirm',
                    name: 'isBreaking',
                    message: 'Breaking change?',
                    default: currentCommit.isBreaking,
                },
            ]);
            const scopePart = answers.scope.trim() ? `(${answers.scope.trim()})` : '';
            const breakingPart = answers.isBreaking ? '!' : '';
            const formatted = `${answers.type}${scopePart}${breakingPart}: ${answers.subject.trim()}`;
            currentCommit = {
                type: answers.type,
                scope: answers.scope.trim() || undefined,
                isBreaking: answers.isBreaking,
                subject: answers.subject.trim(),
                formatted,
                body: currentCommit.body,
            };
            console.log('\n' + chalk.bold('Updated Header:'));
            console.log(chalk.green(`  ${currentCommit.formatted}\n`));
            continue;
        }
        if (action === 'copy') {
            console.log(chalk.green('\nCommit text:'));
            console.log(chalk.cyan(`  ${currentCommit.formatted}\n`));
            process.exit(0);
        }
        if (action === 'commit') {
            executeCommit(currentCommit.formatted);
            const repo = getRepoInfo();
            logCommit(currentCommit, repo.name, repo.path, diff.changedFilesCount, diff.totalAdditions, diff.totalDeletions);
            console.log(chalk.green('\nCommit created successfully.'));
            process.exit(0);
        }
    }
}
