import { type Command } from './types';

export const castCommands: Command[] = [
  {
    name: 'balance',
    args: [{ name: 'who', label: 'Address', required: true }],
    flags: [],
  },
];
