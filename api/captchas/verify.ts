import { handleVerifyProxy } from '../_lib/captchaProxy.js';

export default async function handler(req: any, res: any) {
  return handleVerifyProxy(req, res);
}
