/** Fetch a complete range in deterministic, bounded pages. */
export async function fetchAllPages(fetchPage, pageSize = 500, signal) {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new RangeError('Page size must be a positive integer.');
  const rows = [];
  let offset = 0;
  let total = null;

  while (true) {
    if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
    const { data, error, count } = await fetchPage(offset, offset + pageSize - 1, signal);
    if (error) throw error;
    if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
    if (offset === 0) total = count;
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
    offset += pageSize;
  }

  return { data: rows, count: total ?? rows.length };
}
