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

    app.get('/health', (request, response) => {
      self.onReady(request, response);
    });

    app.get('/live', (request, response) => {
      self.onLive(request, response);
    });

    app.get('/ready', (request, response) => {
      self.onReady(request, response);
    });

    process.on('SIGTERM', () => {
      self.stop();
    });

    const server = app.listen(self.options.port!, self.options.host!, () => {
      self.options.logger?.info(
        `Listening on http://${self.options.host}:${self.options.port} for probes...`
      );
    });
  }

  start(): void {
    this.options.logger?.info('Starting to pass the readiness probe...');
    this.started = true;
  }

  stop(): void {
    const self = this;
    self.options.logger?.info('Terminating gracefully...');
    self.options.logger?.info(
      `Sleeping for ${self.options.graceBeforeSeconds} seconds...`
    );
    setTimeout(() => {
      self.options.logger?.info('Starting to fail the readiness probe...');
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

  private onLive(request: express.Request, response: express.Response): void {
    response.status(this.options.successCode!).send(this.options.successBody);
  }

  private onReady(request: express.Request, response: express.Response): void {
    if (!this.started || this.stopped) {
      response.status(this.options.failureCode!).send(this.options.failureBody);
    } else {
      response.status(this.options.successCode!).send(this.options.successBody);
    }
  }
}
