/**
 * End-to-end check for the R2 upload helpers.
 *
 * Runs against the real bucket configured in <NODE_ENV>.env, uploads throwaway
 * objects under a `__tests__/` prefix and deletes them again on the way out.
 *
 *   pnpm test:upload           # upload, verify, clean up
 *   pnpm test:upload --keep    # leave the objects in the bucket to inspect
 */
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../shared/utils/S3Client.ts';
import { Download, ListFiles, Upload } from '../shared/utils/Upload.ts';
import config from '../config/index.ts';

const PREFIX = `__tests__/upload-${process.pid}/`;
const KEEP = process.argv.includes('--keep');
const uploaded: string[] = [];

let passed = 0;
let failed = 0;

const test = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${error instanceof Error ? error.message : error}`);
  }
};

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const assertEqual = <T>(actual: T, expected: T, message: string) => {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${expected}, got ${actual})`);
  }
};

const put = async (key: string, body: string) => {
  const fullKey = PREFIX + key;
  await Upload(fullKey, body);
  uploaded.push(fullKey);
  return fullKey;
};

const cleanup = async () => {
  for (const key of uploaded) {
    try {
      await s3.send(
        new DeleteObjectCommand({ Bucket: config.bucket, Key: key }),
      );
    } catch (error) {
      console.warn(
        `  WARN  could not delete ${key}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
};

const run = async () => {
  console.log(`bucket: ${config.bucket}`);
  console.log(`prefix: ${PREFIX}\n`);

  await test('Upload returns a 200 response', async () => {
    const response = await Upload(`${PREFIX}status.txt`, 'ok');
    uploaded.push(`${PREFIX}status.txt`);
    assertEqual(response.$metadata.httpStatusCode, 200, 'unexpected status');
  });

  await test('Upload then Download round-trips text', async () => {
    const body = `hello r2 ${PREFIX}`;
    const key = await put('round-trip.txt', body);
    assertEqual(await Download(key), body, 'downloaded content differs');
  });

  await test('Upload accepts a Buffer body', async () => {
    const body = 'buffer payload';
    const key = `${PREFIX}buffer.bin`;
    await Upload(key, Buffer.from(body, 'utf8'));
    uploaded.push(key);
    assertEqual(await Download(key), body, 'downloaded content differs');
  });

  await test('Upload overwrites an existing key', async () => {
    const key = await put('overwrite.txt', 'first');
    await Upload(key, 'second');
    assertEqual(await Download(key), 'second', 'overwrite did not take effect');
  });

  await test('Download rejects for a missing key', async () => {
    const missing = `${PREFIX}does-not-exist.txt`;
    try {
      await Download(missing);
    } catch {
      return;
    }
    throw new Error('expected Download to throw for a missing key');
  });

  await test('ListFiles returns objects under a prefix', async () => {
    await put('listed-a.txt', 'a');
    await put('listed-b.txt', 'b');

    const contents = await ListFiles(PREFIX);
    const keys = contents.map((object) => object.Key);

    assert(
      keys.includes(`${PREFIX}listed-a.txt`) &&
        keys.includes(`${PREFIX}listed-b.txt`),
      `prefix listing missing uploaded keys, got: ${keys.join(', ')}`,
    );
    assert(
      keys.every((key) => key?.startsWith(PREFIX)),
      `prefix listing leaked unrelated keys: ${keys.join(', ')}`,
    );
  });

  await test('ListFiles returns an empty array for an unused prefix', async () => {
    const contents = await ListFiles(`${PREFIX}empty-branch/`);
    assertEqual(contents.length, 0, 'expected no objects');
  });
};

try {
  await run();
} finally {
  if (KEEP) {
    console.log(`\nkeeping ${uploaded.length} object(s) under ${PREFIX}:`);
    for (const key of uploaded) console.log(`  ${key}`);
  } else {
    console.log('\ncleaning up...');
    await cleanup();
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
