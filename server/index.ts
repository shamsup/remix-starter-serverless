import { createRequestHandler } from "@remix-run/architect";
import type { ServerBuild } from "remix";

const build = require('./build') as ServerBuild;

exports.handler = createRequestHandler({
  build,
  getLoadContext(event) {
    // use lambda event to generate a context for loaders
    return {};
  }
});
