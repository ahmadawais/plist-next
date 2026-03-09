import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import pc from 'picocolors';
import { parse } from 'plist-next';

export function parseCommand(): Command {
  const cmd = new Command('parse');
  cmd
    .description('Parse a plist XML file or stdin and output JSON')
    .argument('[file]', 'Path to plist file (reads stdin if omitted)')
    .option('-p, --pretty', 'Pretty-print JSON output', true)
    .action((file: string | undefined, options: { pretty: boolean }) => {
      let xml: string;
      if (file) {
        xml = readFileSync(file, 'utf8');
      } else {
        xml = readFileSync('/dev/stdin', 'utf8');
      }
      const result = parse(xml);
      const output = options.pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
      console.log(output);
    });

  cmd.on('--help', () => {
    console.log('');
    console.log(pc.gray('Examples:'));
    console.log(pc.gray('  $ plist parse Info.plist'));
    console.log(pc.gray('  $ cat Info.plist | plist parse'));
  });

  return cmd;
}
