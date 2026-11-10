import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

let directory: string;
let fileName: string;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'egg-price-maintenance-'));
  fileName = join(directory, 'prices.db');
  const client = new Database(fileName);
  try {
    client.exec(`
      CREATE TABLE EggPrice (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        date text NOT NULL,
        price real NOT NULL,
        storeLocation text NOT NULL,
        storeName text NOT NULL
      );
      INSERT INTO EggPrice (date, price, storeLocation, storeName) VALUES
        ('2026-04-01T08:00:00.000Z', 3.99, 'Chattanooga, TN', 'Test store'),
        ('2026-04-01T18:00:00.000Z', 4.19, 'Chattanooga, TN', 'Test store');
    `);
  } finally {
    client.close();
  }
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

function runCommand(args: string[]) {
  return spawnSync(
    process.execPath,
    ['--import', 'tsx', 'scripts/dedupe-daily-prices.ts', ...args],
    {
      cwd: process.cwd(),
      env: { ...process.env, DB_FILE_NAME: fileName, TZ: 'America/New_York' },
      encoding: 'utf8',
    },
  );
}

function readPrices() {
  const client = new Database(fileName, { readonly: true });
  try {
    return client.prepare('SELECT price FROM EggPrice ORDER BY id').all();
  } finally {
    client.close();
  }
}

describe('operator maintenance command', () => {
  it.each([{ args: [] }, { args: ['--no'] }, { args: ['--yes', '--unexpected'] }])(
    'does not delete records without explicit valid confirmation: $args',
    ({ args }) => {
      const result = runCommand(args);
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(readPrices()).toHaveLength(2);
    },
  );

  it('keeps the latest daily record when an operator explicitly confirms', () => {
    const result = runCommand(['--yes']);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(readPrices()).toEqual([{ price: 4.19 }]);
  });
});
