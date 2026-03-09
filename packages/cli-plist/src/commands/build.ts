import { Command } from 'commander';
import pc from 'picocolors';
import { build } from 'plist-next';
import type { PlistValue } from 'plist-next';

export function buildCommand(): Command {
  const cmd = new Command('build');
  cmd
    .description('Build a plist XML string from a JSON value')
    .argument('<json>', 'JSON value to encode as plist')
    .option('--no-pretty', 'Disable pretty-printing')
    .action((jsonInput: string, options: { pretty: boolean }) => {
      const obj = JSON.parse(jsonInput) as PlistValue;
      const xml = build(obj, { pretty: options.pretty });
      console.log(xml);
    });

  cmd.on('--help', () => {
    console.log('');
    console.log(pc.gray('Examples:'));
    console.log(pc.gray('  $ plist build \'{"foo":"bar"}\''));
    console.log(pc.gray('  $ plist build \'["hello","world"]\''));
  });

  return cmd;
}
