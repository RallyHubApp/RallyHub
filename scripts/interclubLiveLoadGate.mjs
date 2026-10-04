const baseUrl = String(process.env.RALLYHUB_LOAD_BASE_URL || '').replace(/\/$/, '');
const displayToken = String(process.env.RALLYHUB_INTERCLUB_DISPLAY_TOKEN || '').trim();
const confirmLive = process.env.RALLYHUB_LOAD_CONFIRM === 'YES';
const allowFallback = process.env.RALLYHUB_LOAD_ALLOW_FALLBACK === 'YES';
const appId = '6a01dc00702b7dd2a2978c28';
const scenarios = String(process.env.RALLYHUB_LOAD_SCENARIOS || '25,50,100,200')
  .split(',')
  .map(v => Number(v.trim()))
  .filter(v => Number.isInteger(v) && v > 0 && v <= 500);
const waves = Math.max(1, Math.min(10, Number(process.env.RALLYHUB_LOAD_WAVES || 2)));
const spacingMs = Math.max(0, Number(process.env.RALLYHUB_LOAD_SPACING_MS || 0));
const maxP95Ms = Math.max(250, Number(process.env.RALLYHUB_LOAD_MAX_P95_MS || 4000));

if (!baseUrl) {
  console.error('Set RALLYHUB_LOAD_BASE_URL, for example https://staging.example.com');
  process.exit(2);
}
if (!/^ccd_[0-9a-f]{32}$/i.test(displayToken)) {
  console.error('Set RALLYHUB_INTERCLUB_DISPLAY_TOKEN to a test/staging Interclub Player Link token.');
  process.exit(2);
}
const hostname = new URL(baseUrl).hostname;
if (/rallyhub\.ie$/i.test(hostname) && !confirmLive) {
  console.error('Live RallyHub load testing is disabled by default. Set RALLYHUB_LOAD_CONFIRM=YES only for an agreed controlled window.');
  process.exit(2);
}
if (!scenarios.length) {
  console.error('No valid load scenarios supplied.');
  process.exit(2);
}

const endpoint = `${baseUrl}/api/apps/${appId}/functions/getPublicClubChallengeDisplay`;
const payload = JSON.stringify({ token: displayToken });
const percentile = (values, fraction) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a,b)=>a-b);
  return sorted[Math.min(sorted.length-1, Math.round((sorted.length-1)*fraction))];
};

async function requestOnce(index) {
  if (spacingMs) await new Promise(resolve => setTimeout(resolve,index*spacingMs));
  const started = performance.now();
  try {
    const response = await fetch(endpoint, {
      method:'POST',
      headers:{ 'content-type':'application/json', 'user-agent':'RallyHub-interclub-live-load-gate/1.0' },
      body:payload,
    });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return {
      status:response.status,
      ms:performance.now()-started,
      retryAfter:response.headers.get('retry-after'),
      snapshot:json?.snapshot === true,
      eventStatus:json?.event?.status || null,
      error:response.ok ? null : (json?.error || text.slice(0,180)),
    };
  } catch (error) {
    return { status:'ERR', ms:performance.now()-started, retryAfter:null, snapshot:false, eventStatus:null, error:String(error?.message||error) };
  }
}

let failed = false;
for (const concurrent of scenarios) {
  for (let wave=1; wave<=waves; wave+=1) {
    const started = performance.now();
    const rows = await Promise.all(Array.from({length:concurrent},(_,index)=>requestOnce(index)));
    const elapsedMs = performance.now()-started;
    const statusCounts = rows.reduce((acc,row)=>{ acc[row.status]=(acc[row.status]||0)+1; return acc; },{});
    const ok = rows.filter(row=>row.status===200);
    const latencies = ok.map(row=>row.ms);
    const nonSnapshot = ok.filter(row=>!row.snapshot).length;
    const failures = rows.filter(row=>row.status!==200);
    const result = {
      concurrent, wave, spacingMs,
      elapsedMs:Math.round(elapsedMs),
      statusCounts,
      snapshotResponses:ok.length-nonSnapshot,
      fallbackResponses:nonSnapshot,
      p50Ms:latencies.length?Math.round(percentile(latencies,.50)):null,
      p95Ms:latencies.length?Math.round(percentile(latencies,.95)):null,
      maxMs:latencies.length?Math.round(Math.max(...latencies)):null,
      retryAfterObserved:[...new Set(failures.map(row=>row.retryAfter).filter(Boolean))],
      sampleFailure:failures[0]?.error || null,
    };
    console.log(JSON.stringify(result));
    if (failures.length) failed = true;
    if (!allowFallback && nonSnapshot) failed = true;
    if (latencies.length && percentile(latencies,.95) > maxP95Ms) failed = true;
    await new Promise(resolve=>setTimeout(resolve,1500));
  }
}

if (failed) {
  console.error(`INTERCLUB LIVE LOAD GATE FAIL — requires 100% HTTP 200, ${allowFallback?'fallback allowed':'snapshot fast path only'}, p95 <= ${maxP95Ms} ms.`);
  process.exit(1);
}
console.log(`INTERCLUB LIVE LOAD GATE PASS — scenarios ${scenarios.join('/')} devices × ${waves} wave(s), snapshot fast path, no request failures.`);
