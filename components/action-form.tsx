'use client';

import { useActionState } from 'react';
import type { FormState } from '@/actions/actions';

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  label: string;
  successMessage?: string;
};

export function ActionForm({ action, children, label, successMessage }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} noValidate={false}>
      {children}
      {state?.error && <p className="form-message error" role="alert">{state.error}</p>}
      {state?.ok && successMessage && (
        <p className="form-message success" role="status">{successMessage}</p>
      )}
      <button className="button primary" disabled={pending} aria-busy={pending}>
        {pending ? 'WORKING…' : label}
      </button>
    </form>
  );
}
