import express from 'express';

export interface Logger {
  info(message: string): void;
}

export interface Options {
  host?: string;
  port?: number;
  graceBeforeSeconds?: number;
  graceAfterSeconds?: number;
  successBody?: string;
  failureBody?: string;
  successCode?: number;
  failureCode?: number;
  logger?: Logger;
}

const defaultOptions: Options = {
  host: '0.0.0.0',
  port: 9000,
  graceBeforeSeconds: 0,
  graceAfterSeconds: 0,
  successCode: 200,
  failureCode: 500,
  logger: console,
};

export class Status {
  options: Options;
  started: boolean = false;
  stopped: boolean = false;

  constructor(givenOptions: Options = defaultOptions) {
    const self = this;

    this.options = { ...defaultOptions, ...givenOptions };

    const app = express();

    app.get(
      '/health',
      (request: express.Request, response: express.Response) => {
        response
          .status(self.options.successCode!)
          .send(self.options.successBody);
      }
    );

    app.get('/live', (request: express.Request, response: express.Response) => {
      response.status(self.options.successCode!).send(self.options.successBody);
    });

    app.get(
      '/ready',
      (request: express.Request, response: express.Response) => {
        if (!self.started || self.stopped) {
          response
            .status(self.options.failureCode!)
            .send(self.options.failureBody);
        } else {
          response
            .status(self.options.successCode!)
            .send(self.options.successBody);
        }
      }
    );

    process.on('SIGTERM', () => {
      self.stop();
    });

    const server = app.listen(self.options.port!, self.options.host!, () => {
      self.options.logger?.info(
        `Listening on http://${self.options.host}:${self.options.port} for status...`
      );
    });
  }

  start(): void {
    this.started = true;
  }

  stop(): void {
    const self = this;
    self.options.logger?.info('Terminating gracefully...');
    self.options.logger?.info(
      `Sleeping for ${self.options.graceBeforeSeconds} seconds...`
    );
    setTimeout(() => {
      self.stopped = true;
      self.options.logger?.info(
        `Sleeping for ${self.options.graceAfterSeconds} seconds...`
      );
      setTimeout(() => {
        self.options.logger?.info('Well done.');
        process.exit(0);
      }, 1000 * self.options.graceAfterSeconds!);
    }, 1000 * self.options.graceBeforeSeconds!);
  }
}
