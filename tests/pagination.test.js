import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchAllPages } from '../src/lib/pagination.js';

test('paged inventory fetch combines all pages and retains the exact first-page count', async () => {
  const calls = [];
  const pages = [[1, 2], [3, 4], [5]];
  const result = await fetchAllPages(async (from, to) => {
    calls.push([from, to]);
    return { data: pages[from / 2], count: from === 0 ? 5 : null };
  }, 2);

  assert.deepEqual(calls, [[0, 1], [2, 3], [4, 5]]);
  assert.deepEqual(result, { data: [1, 2, 3, 4, 5], count: 5 });
});

test('paged inventory fetch stops on an empty first page and uses row count when absent', async () => {
  let calls = 0;
  const result = await fetchAllPages(async () => { calls += 1; return { data: [], count: null }; }, 10);
  assert.equal(calls, 1);
  assert.deepEqual(result, { data: [], count: 0 });
});

test('paged inventory fetch surfaces a page failure without returning an incomplete result', async () => {
  await assert.rejects(fetchAllPages(async () => ({ data: null, error: new Error('page failed') }), 10), /page failed/);
  await assert.rejects(fetchAllPages(async () => ({ data: [] }), 0), RangeError);
});

test('paged inventory fetch stops before starting another request after abort', async () => {
  const controller = new AbortController();
  let calls = 0;
  await assert.rejects(fetchAllPages(async () => {
    calls += 1;
    controller.abort();
    return { data: [1, 2] };
  }, 2, controller.signal), { name: 'AbortError' });
  assert.equal(calls, 1);
});
