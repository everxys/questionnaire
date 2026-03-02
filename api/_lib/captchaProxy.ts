function getUpstreamBaseUrl(): string {
  const baseUrl = process.env.CAPTCHA_BASE_URL?.trim();
  return baseUrl && baseUrl.length > 0 ? baseUrl : 'https://captcha.everxys.top';
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    promise
      .then((value) => resolve(value))
      .catch((err) => reject(err))
      .finally(() => clearTimeout(timeout));
  });
}

async function readJsonBody(req: any): Promise<any> {
  if (req?.body && typeof req.body === 'object') return req.body;
  if (typeof req?.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks: any[] = [];
  try {
    for await (const chunk of req) chunks.push(chunk);
  } catch {
    return {};
  }

  const raw = Buffer.concat(chunks.map((c) => (Buffer.isBuffer(c) ? c : Buffer.from(String(c))))).toString('utf-8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number): Promise<{ status: number; json: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await withTimeout(fetch(url, { ...init, signal: controller.signal }), timeoutMs);
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  } finally {
    clearTimeout(timeout);
  }
}

export async function handleVerifyProxy(req: any, res: any): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
    return;
  }

  const timeoutMs = Number(process.env.CAPTCHA_TIMEOUT_MS || '5000');
  const upstream = `${getUpstreamBaseUrl().replace(/\/$/, '')}/api/verify`;
  const body = await readJsonBody(req);

  const upstreamRes = await fetchJson(
    upstream,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    },
    timeoutMs,
  ).catch((err) => {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: err instanceof Error ? err.message : 'upstream error' }));
    return null;
  });

  if (!upstreamRes) return;
  res.statusCode = upstreamRes.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(upstreamRes.json ?? {}));
}

