import express from 'express';
import path from 'path';

type UpstreamVerifyResponse =
  | { success: true; message: string; token: string }
  | { success: false; message?: string };

type UpstreamCodeResponse =
  | { success: true; code: string; expiresAt: number; message: string }
  | { success: false; message?: string };

function getUpstreamBaseUrl(): string {
  return process.env.CAPTCHA_BASE_URL?.trim() || 'https://captcha.everxys.top';
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

async function fetchJson(url: string, init: RequestInit, timeoutMs: number): Promise<{ status: number; json: unknown }> {
  const res = await withTimeout(fetch(url, init), timeoutMs);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

const app = express();
app.use(express.json());

async function proxyVerify(req: express.Request, res: express.Response): Promise<void> {
  const upstream = `${getUpstreamBaseUrl().replace(/\/$/, '')}/api/verify`;
  const timeoutMs = Number(process.env.CAPTCHA_TIMEOUT_MS || '5000');

  const { status, json } = await fetchJson(
    upstream,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {}),
    },
    timeoutMs,
  ).catch((err) => {
    res.status(502).json({ success: false, message: err instanceof Error ? err.message : 'upstream error' });
    return null;
  });

  if (!status) return;
  res.status(status).json(json as UpstreamVerifyResponse);
}

async function proxyCode(_req: express.Request, res: express.Response): Promise<void> {
  const upstream = `${getUpstreamBaseUrl().replace(/\/$/, '')}/api/code`;
  const timeoutMs = Number(process.env.CAPTCHA_TIMEOUT_MS || '5000');
  const adminSecret = process.env.CAPTCHA_ADMIN_SECRET;

  if (!adminSecret) {
    res.status(500).json({ success: false, message: 'CAPTCHA_ADMIN_SECRET is not set' });
    return;
  }

  const { status, json } = await fetchJson(
    upstream,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': adminSecret,
      },
    },
    timeoutMs,
  ).catch((err) => {
    res.status(502).json({ success: false, message: err instanceof Error ? err.message : 'upstream error' });
    return null;
  });

  if (!status) return;
  res.status(status).json(json as UpstreamCodeResponse);
}

// Support both `/api/captcha/*` and `/api/captchas/*` prefixes (some gateways use plural).
app.post('/api/captcha/verify', proxyVerify);
app.post('/api/captchas/verify', proxyVerify);
app.post('/api/captcha/code', proxyCode);
app.post('/api/captchas/code', proxyCode);

const distDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(distDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || '5173');
app.listen(port, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${port}`);
});
