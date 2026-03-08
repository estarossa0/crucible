export interface CommandArg {
  name: string;
  label: string;
  required: boolean;
}

interface CommandFlagBase {
  name: string;
  label: string;
}

export interface BooleanFlag extends CommandFlagBase {
  type: 'boolean';
  default: boolean;
}

export interface LevelFlag extends CommandFlagBase {
  type: 'level';
  levels: string[];
  default: number;
}

export type CommandFlag = BooleanFlag | LevelFlag;

export interface Command {
  name: string;
  args: CommandArg[];
  flags: CommandFlag[];
}
