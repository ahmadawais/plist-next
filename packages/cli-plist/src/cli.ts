import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import pc from 'picocolors';
import { buildCommand } from './commands/build.js';
import { parseCommand } from './commands/parse.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
  name: string;
};

const program = new Command();

program
  .name('plist')
  .description('Apple plist parser/builder CLI')
  .version(pkg.version, '-v, --version');

program.addCommand(parseCommand());
program.addCommand(buildCommand());

program.on('--help', () => {
  console.log('');
  console.log(pc.gray('Examples:'));
  console.log(pc.gray('  $ plist parse file.plist'));
  console.log(pc.gray('  $ cat file.plist | plist parse'));
  console.log(pc.gray('  $ plist build \'{"foo":"bar"}\''));
});

program.parse(process.argv);
