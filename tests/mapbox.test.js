import assert from 'node:assert/strict';
import test from 'node:test';
import { geocodeLocalities, isMapboxResourceError, MAX_CONCURRENT_GEOCODES } from '../src/lib/mapbox.js';

test('locality geocoding preserves input order and caps parallel requests', async () => {
  const names = ['Mira Road East', 'Bhayandar West', 'Kashimira', 'Mira Road West', 'Bhayandar East'];
  let active = 0;
  let peak = 0;
  const results = await geocodeLocalities(names, undefined, async (name) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return { name };
  });

  assert.equal(peak, MAX_CONCURRENT_GEOCODES);
  assert.deepEqual(results.map(({ value }) => value.name), names);
});

test('one locality failure does not discard successful coordinates', async () => {
  const results = await geocodeLocalities(['Mira Road East', 'Unknown Locality', 'Kashimira'], undefined, async (name) => {
    if (name === 'Unknown Locality') throw new Error('provider unavailable');
    return { name, longitude: 72.8, latitude: 19.3 };
  });

  assert.deepEqual(results.map((result) => result.status), ['fulfilled', 'rejected', 'fulfilled']);
  assert.deepEqual(results.filter((result) => result.status === 'fulfilled').map(({ value }) => value.name), ['Mira Road East', 'Kashimira']);
});

test('aborted locality geocoding stops without starting the remaining names', async () => {
  const controller = new AbortController();
  let started = 0;
  const operation = geocodeLocalities(['one', 'two', 'three', 'four'], controller.signal, async (_name, signal) => {
    started += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    return null;
  });
  controller.abort();

  await assert.rejects(operation, { name: 'AbortError' });
  assert.ok(started <= MAX_CONCURRENT_GEOCODES);
});

test('map resource errors include auth, tile and style failures but ignore unrelated errors', () => {
  assert.equal(isMapboxResourceError({ error: { status: 401, message: 'Not authorized' } }), true);
  assert.equal(isMapboxResourceError({ error: { message: 'Failed to load tile' }, sourceId: 'composite' }), true);
  assert.equal(isMapboxResourceError({ error: { message: 'Style load failed' } }), true);
  assert.equal(isMapboxResourceError({ error: { message: 'Unrelated marker warning' } }), false);
});
