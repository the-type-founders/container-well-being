import { beforeAll, expect, test } from 'vitest';

import { Counter, Instrumentation } from '../src/index.ts';

const instrumentation = new Instrumentation();

const counter = new Counter({
  name: 'example_counter',
  help: 'Example of a counter',
});

test('/metrics', async () => {
  counter.inc();
  const response = await fetch('http://0.0.0.0:9090/metrics');
  expect(response.status).toBe(200);
});
