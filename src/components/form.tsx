import type { ComponentProps, ReactNode } from "react";

// フォームで使う共通の部品

export function Field({
  label,
  name,
  errors,
  hint,
  ...inputProps
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: ReactNode;
} & ComponentProps<"input">) {
  const errorId = `${name}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? errorId : undefined}
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-text outline-none transition focus:border-accent aria-invalid:border-danger"
        {...inputProps}
      />
      {hint && !errors?.length && <p className="text-xs text-muted">{hint}</p>}
      {errors?.length ? (
        <p id={errorId} className="text-xs text-danger">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent px-4 py-2.5 font-medium text-bg transition hover:bg-accent-strong disabled:opacity-60"
    >
      {pending ? "処理中…" : children}
    </button>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
