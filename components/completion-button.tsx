'use client';

import { useState, useTransition } from 'react';
import { Check, Plus } from 'lucide-react';
import { completeStack } from '@/actions/actions';

type Props = { id: string; name: string; completed: boolean; compact?: boolean; broken?: boolean };

export function CompletionButton({ id, name, completed, compact = false, broken = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const done = completed && !isPending;

  function complete() {
    if (!navigator.onLine) {
      setError('Reconnect to stack proof.');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        await completeStack(id);
        navigator.vibrate?.(20);
      } catch {
        setError('Could not add proof. Try again.');
      }
    });
  }

  if (compact) {
    return (
      <div className="completion-wrap">
        <button
          type="button"
          className={`round completion ${done ? 'is-complete' : ''}`}
          onClick={complete}
          disabled={completed || isPending}
          aria-label={done ? `${name} completed this period` : `Complete ${name}`}
          aria-pressed={done}
        >
          {done ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
        </button>
        {error && <span className="sr-only" role="alert">{error}</span>}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="button primary"
        onClick={complete}
        disabled={completed || isPending}
        aria-busy={isPending}
      >
        {isPending ? 'STACKING…' : completed ? '✓ STACKED TODAY' : broken ? 'START AGAIN' : '+ STACK TODAY'}
      </button>
      {error && <p className="form-message error" role="alert">{error}</p>}
    </>
  );
}
