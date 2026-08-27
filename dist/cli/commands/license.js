import chalk from 'chalk';
import { getLicenseInfo } from '../../core/license.js';
export async function handleLicenseCommand() {
    const info = getLicenseInfo();
    console.log(chalk.cyan(`\n${info.name} is 100% Free and Open Source software.`));
    console.log(`  License: ${chalk.green(info.type)}`);
    console.log(`  Repository: ${chalk.yellow(info.url)}\n`);
}
