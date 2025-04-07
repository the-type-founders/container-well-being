import { setTimeout } from 'node:timers/promises';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { Status } from '../src/index.ts';

let status!: Status;

beforeAll(async () => {
  status = new Status({ exitCode: undefined });
});

afterAll(async () => {
  await status.stop();
});

test('/health', async () => {
  const response = await request('/health');
  expect(response.status).toBe(500);
});

test('/live', async () => {
  const response = await request('/live');
  expect(response.status).toBe(200);
});

test('/ready', async () => {
  const response = await request('/ready');
  expect(response.status).toBe(500);
});

async function request(path: string): Promise<Response> {
  while (true) {
    try {
      return await fetch(`http://0.0.0.0:9000${path}`);
    } catch (error) {
      await setTimeout(1000);
    }
  }
}
