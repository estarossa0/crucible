import React from "react";
import { render } from "ink";
import type { Mode } from "./lib/index.ts";
import { config } from "./lib/index.ts";
import App from "./App.tsx";

function validateEnv() {
  if (!process.env["ALCHEMY_API_KEY"]) {
    console.error("ALCHEMY_API_KEY environment variable is required.");
    process.exit(1);
  }
}

export function bootstrap(mode?: Mode) {
  validateEnv();
  render(React.createElement(App, { mode: mode ?? config.defaultMode }));
}
