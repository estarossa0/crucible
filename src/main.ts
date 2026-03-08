import { render } from 'ink';
import React from 'react';
import App from './App';
import { config, type Mode } from './lib/index';

function validateEnv() {
  if (!process.env.ALCHEMY_API_KEY) {
    console.error('ALCHEMY_API_KEY environment variable is required.');
    process.exit(1);
  }
}

export function bootstrap(mode?: Mode) {
  validateEnv();
  render(React.createElement(App, { mode: mode ?? config.defaultMode }));
}
