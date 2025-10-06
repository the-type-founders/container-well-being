import express from 'express';
import * as http from 'http';
import client from 'prom-client';

import { Logger } from './common.js';

export interface Options {
  host?: string;
  port?: number;
  defaultMetrics?: boolean;
  logger?: Logger;
}

const defaultOptions: Options = {
  host: '0.0.0.0',
  port: 9090,
  defaultMetrics: false,
  logger: console,
};

export class Client {
  options: Options;

  app: express.Express;
  server: http.Server;

  constructor(givenOptions: Options = defaultOptions) {
    const self = this;

    this.options = { ...defaultOptions, ...givenOptions };

    if (this.options.defaultMetrics) {
      client.collectDefaultMetrics();
    }

    this.app = express();

    this.app.get(
      '/metrics',
      async (request: express.Request, response: express.Response) => {
        response.set('Content-Type', client.register.contentType);
        response.end(await client.register.metrics());
      }
    );

    this.server = this.app
      .listen(self.options.port!, self.options.host!, () => {
        const address = `http://${self.options.host}:${self.options.port}`;
        self.options.logger?.info(`Listening on ${address} for metrics...`);
      })
      .on('error', (error) => {
        console.error(error);
      });
  }
}
