# Container Well-being

The package provides standard checks and probes for containers on Kubernetes.

## Installation

```shell
npm install @thetypefounders/container-well-being --save
```

## Usage

```javascript
import express from 'express';
import { Status } from '@thetypefounders/container-well-being';

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

const app = express();

const server = app
  .listen(8080, '0.0.0.0', () => {
    status.start();
  })
  .on('error', (error) => {
    status.stop();
  });
```
