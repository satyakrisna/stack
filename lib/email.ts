import { serverEnv } from './env';

type AuthEmail = {
  kind: 'verify' | 'reset';
  email: string;
  url: string;
};

/** Minimal provider boundary. Development logs links; production requires a webhook provider. */
export async function sendAuthEmail(message: AuthEmail): Promise<void> {
  const env = serverEnv();
  if (env.NODE_ENV !== 'production') {
    console.info(`STACK ${message.kind}: ${message.url}`);
    return;
  }

  if (!env.EMAIL_WEBHOOK_URL || !env.EMAIL_WEBHOOK_SECRET || !env.EMAIL_FROM) {
    throw new Error('Production email delivery is not configured');
  }

  const response = await fetch(env.EMAIL_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.EMAIL_WEBHOOK_SECRET}`,
    },
    body: JSON.stringify({ ...message, from: env.EMAIL_FROM }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Email delivery failed');
}
