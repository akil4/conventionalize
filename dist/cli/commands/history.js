import chalk from 'chalk';
import fs from 'fs';
import { exportChangelog, getCommitStats, getHistory } from '../../core/history.js';
export async function handleHistoryCommand(options) {
    const history = getHistory();
    if (history.commits.length === 0) {
        console.log(chalk.yellow('\nNo local history recorded. Execute a commit using conventionalize to start tracking.'));
        return;
    }
    if (options.export) {
        const md = exportChangelog(history.commits);
        if (typeof options.export === 'string' && options.export !== 'true') {
            fs.writeFileSync(options.export, md, 'utf8');
            console.log(chalk.green(`\nExported changelog to ${options.export}`));
        }
        else {
            console.log('\n' + md);
        }
        return;
    }
    console.log(chalk.cyan(`\nCommit History (${history.commits.length} entries):\n`));
    history.commits.forEach((c) => {
        const typeColor = c.type === 'feat' ? chalk.green : c.type === 'fix' ? chalk.red : chalk.blue;
        const dateStr = new Date(c.timestamp).toISOString().split('T')[0];
        console.log(`  ${typeColor(c.formatted)} ${chalk.gray(`[${c.repoName} | ${dateStr}]`)}`);
    });
    console.log('');
}
export async function handleStatsCommand() {
    const history = getHistory();
    if (history.commits.length === 0) {
        console.log(chalk.yellow('\nNo commit stats available. Execute commits using conventionalize first.'));
        return;
    }
    const stats = getCommitStats(history.commits);
    console.log(chalk.cyan('\nCommit Metrics & Statistics\n'));
    console.log(`  Total Commits: ${stats.totalCommits}`);
    console.log(`  Code Additions: +${stats.totalAdditions}`);
    console.log(`  Code Deletions: -${stats.totalDeletions}`);
    console.log(`  Files Touched:  ${stats.totalFiles}\n`);
    console.log('Breakdown by Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
        const pct = Math.round((count / stats.totalCommits) * 100);
        console.log(`  ${type.padEnd(10)}: ${count} (${pct}%)`);
    });
    console.log('');
}
