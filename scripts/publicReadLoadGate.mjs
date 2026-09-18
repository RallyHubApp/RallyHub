const baseUrl = String(process.env.RALLYHUB_LOAD_BASE_URL || '').replace(/\/$/, '');
const confirmLive = process.env.RALLYHUB_LOAD_CONFIRM === 'YES';
const appId = '6a01dc00702b7dd2a2978c28';
const scenarios = String(process.env.RALLYHUB_LOAD_SCENARIOS || '10,25')
  .split(',')
  .map(value => Number(value.trim()))
  .filter(value => Number.isInteger(value) && value > 0 && value <= 500);
const spacingMs = Math.max(0, Number(process.env.RALLYHUB_LOAD_SPACING_MS || 0));

if (!baseUrl) {
  console.error('Set RALLYHUB_LOAD_BASE_URL. Example: https://rallyhub.ie');
  process.exit(2);
}
if (/rallyhub\.ie$/i.test(new URL(baseUrl).hostname) && !confirmLive) {
  console.error('Live RallyHub load testing is disabled by default. Set RALLYHUB_LOAD_CONFIRM=YES after agreeing a controlled test window.');
  process.exit(2);
}
if (!scenarios.length) {
  console.error('No valid load scenarios supplied.');
  process.exit(2);
}

const endpoint = `${baseUrl}/api/apps/${appId}/functions/directoryListingProfile`;
const payload = JSON.stringify({ action: 'public_get', listingSlug: 'ashbourne-pickleball' });

const percentile = (values, fraction) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.round((sorted.length - 1) * fraction))];
};

async function requestOnce(index) {
  if (spacingMs > 0) await new Promise(resolve => setTimeout(resolve, index * spacingMs));
  const started = performance.now();
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'RallyHub-controlled-load-gate/1.0',
      },
      body: payload,
    });
    const body = await response.text();
    return {
      status: response.status,
      ms: performance.now() - started,
      retryAfter: response.headers.get('retry-after'),
      error: response.ok ? null : body.slice(0, 180),
    };
  } catch (error) {
    return { status: 'ERR', ms: performance.now() - started, retryAfter: null, error: String(error?.message || error) };
  }
}

for (const concurrent of scenarios) {
  const started = performance.now();
  const rows = await Promise.all(Array.from({ length: concurrent }, (_, index) => requestOnce(index)));
  const elapsedMs = performance.now() - started;
  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});
  const okLatency = rows.filter(row => row.status === 200).map(row => row.ms);
  const failures = rows.filter(row => row.status !== 200);
  console.log(JSON.stringify({
    concurrent,
    spacingMs,
    elapsedMs: Math.round(elapsedMs),
    statusCounts: counts,
    p50Ms: okLatency.length ? Math.round(percentile(okLatency, 0.50)) : null,
    p95Ms: okLatency.length ? Math.round(percentile(okLatency, 0.95)) : null,
    maxMs: okLatency.length ? Math.round(Math.max(...okLatency)) : null,
    retryAfterObserved: [...new Set(failures.map(row => row.retryAfter).filter(Boolean))],
    sampleFailure: failures[0]?.error || null,
  }));
  await new Promise(resolve => setTimeout(resolve, 4000));
}
