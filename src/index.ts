import { Command } from 'commander';
import { Mode } from './lib/index';
import { bootstrap } from './main';

const program = new Command()
  .name('crucible')
  .description('Interactive TUI for Foundry forge & cast');

program
  .command('forge')
  .description('Interactive script runner')
  .action(() => bootstrap(Mode.Forge));

program
  .command('cast')
  .description('Interactive command runner')
  .action(() => bootstrap(Mode.Cast));

program.action(() => bootstrap());

program.parse();
