# Container Well-being

The package provides probes and metrics for containers on Kubernetes.

## Installation

```shell
npm install @thetypefounders/container-well-being --save
```

## Usage

```javascript
import { Instrumentation, Status } from '@thetypefounders/container-well-being';
import express from 'express';

const status = new Status({
  // The host to bind to.
  host: '0.0.0.0',
  // The port to listen to.
  port: 9000,
  // The time to wait after SIGTERM before failing the readiness probe.
  graceBeforeSeconds: 120,
  // The time to wait after failing the readiness probe before shutting down.
  graceAfterSeconds: 80,
});

const instrumentation = new Instrumentation({
  // The host to bind to.
  host: '0.0.0.0',
  // The port to listen to.
  port: 9090,
  // Whether to collect default metrics.
  defaultMetrics: false,
});

const counter = Instrumentation.Counter({
  name: 'example_counter',
  help: 'Example of a counter',
});

const app = express();

app.get('/', (request, response) => {
  counter.inc();
  response.status(204).send();
});

const server = app
  .listen(8080, '0.0.0.0', () => {
    status.start();
  })
  .on('error', (error) => {
    status.stop();
  });
```
