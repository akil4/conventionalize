import chalk from 'chalk';
import { installGitHook, uninstallGitHook } from '../../core/hooks.js';
export async function handleHookCommand(action) {
    if (action === 'install') {
        const res = installGitHook();
        if (res.success) {
            console.log(chalk.bold.green(`\n✔ ${res.message}`));
            console.log(chalk.gray('Standard `git commit` commands will now automatically use GitCommit AI generated messages!\n'));
        }
        else {
            console.log(chalk.bold.red(`\n✖ ${res.message}\n`));
        }
    }
    else if (action === 'uninstall') {
        const res = uninstallGitHook();
        if (res.success) {
            console.log(chalk.bold.green(`\n✔ ${res.message}\n`));
        }
        else {
            console.log(chalk.bold.red(`\n✖ ${res.message}\n`));
        }
    }
    else {
        console.log(chalk.yellow('\nUsage: gcai hook <install|uninstall>\n'));
    }
}
