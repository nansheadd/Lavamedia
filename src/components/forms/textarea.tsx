import clsx from 'clsx';
import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ id, label, hint, error, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
        <textarea
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={clsx(
            'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900',
            className
          )}
          {...props}
        />
        {hint ? (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
