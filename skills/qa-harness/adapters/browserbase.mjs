// Optional remote browser: create a Browserbase session and hand qa.mjs its CDP URL.
// Use it to test a deployed preview from a real cloud browser instead of your laptop.
// Needs: BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID in the environment.
// (BROWSERBASE_BASE_URL optionally points at a proxy in front of the API.)
// The remote browser cannot see files on your machine: pass a public URL.
export async function createSession() {
  const key = process.env.BROWSERBASE_API_KEY, project = process.env.BROWSERBASE_PROJECT_ID;
  const baseUrl = (process.env.BROWSERBASE_BASE_URL || 'https://api.browserbase.com').replace(/\/$/, '');
  if (!key || !project) throw new Error('Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID to use --remote browserbase.');
  const r = await fetch(`${baseUrl}/v1/sessions`, {
    method: 'POST', headers: { 'X-BB-API-Key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: project, keepAlive: false, timeout: 1800, browserSettings: { viewport: { width: 1440, height: 900 } } }),
  });
  if (!r.ok) throw new Error(`Browserbase answered ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const s = await r.json();
  return {
    id: s.id, connectUrl: s.connectUrl,
    close: async () => { // end the session so it stops billing
      await fetch(`${baseUrl}/v1/sessions/${s.id}`, { method: 'POST', headers: { 'X-BB-API-Key': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: project, status: 'REQUEST_RELEASE' }) }).catch(() => {});
    },
  };
}
