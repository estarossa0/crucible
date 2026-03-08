import { render } from 'ink';
import React from 'react';

import App from '@app/App';
import { config, type Mode } from '@utils/index';

function validateEnv() {
  if (!process.env.ALCHEMY_API_KEY) {
    console.error('ALCHEMY_API_KEY environment variable is required.');
    process.exit(1);
  }
}

export async function bootstrap(mode?: Mode) {
  validateEnv();
  const app = render(React.createElement(App, { mode: mode ?? config.defaultMode }));
  await app.waitUntilExit();
  process.exit(0);
}
