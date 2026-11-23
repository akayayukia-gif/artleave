import type { ComponentProps, ReactNode } from "react";

// フォームで使う共通の部品。紙のカード（paper-card）の上に置く前提で、インクの色で描く。

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
    <div className="space-y-1">
      <label htmlFor={name} className="block text-xs font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? errorId : undefined}
        className="w-full border-0 border-b-[1.5px] border-ink bg-transparent px-0 py-2 text-base text-ink outline-none transition focus:border-ok focus:shadow-[0_1.5px_0_var(--ok)] aria-invalid:border-danger"
        {...inputProps}
      />
      {hint && !errors?.length && <p className="text-xs text-ink-muted">{hint}</p>}
      {errors?.length ? (
        <p id={errorId} className="text-xs font-medium text-danger">
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
      className="w-full bg-ink px-4 py-3.5 text-sm font-bold tracking-widest text-paper transition hover:-translate-y-px disabled:translate-y-0 disabled:opacity-60"
    >
      {pending ? "処理中…" : children}
    </button>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
