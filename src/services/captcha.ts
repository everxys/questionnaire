export type CaptchaVerifyResponse =
  | { success: true; message: string; token: string }
  | { success: false; message?: string };

export type CaptchaVerifyResult =
  | { ok: true; token: string; message: string; status?: number }
  | { ok: false; status?: number; message: string };

type VerifyArgs = {
  verifyUrl: string;
  code: string;
  deviceId: string;
  timeoutMs: number;
  retry409Once: boolean;
};

async function fetchJsonWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ status: number; json: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  } finally {
    clearTimeout(timeout);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function verifyCaptchaCode(args: VerifyArgs): Promise<CaptchaVerifyResult> {
  const url = args.verifyUrl;
  const body = { code: args.code, deviceId: args.deviceId };

  const attempt = async (): Promise<CaptchaVerifyResult> => {
    try {
      const { status, json } = await fetchJsonWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        args.timeoutMs,
      );

      const data = json as CaptchaVerifyResponse;
      if (status >= 200 && status < 300 && data && (data as any).success === true) {
        return {
          ok: true,
          status,
          token: (data as any).token,
          message: (data as any).message ?? 'OK',
        };
      }

      const message = (data as any)?.message;
      return { ok: false, status, message: typeof message === 'string' ? message : '验证失败' };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : '网络异常' };
    }
  };

  const first = await attempt();
  if (!first.ok && first.status === 409 && args.retry409Once) {
    await sleep(300);
    return attempt();
  }
  return first;
}
