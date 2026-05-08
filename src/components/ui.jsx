import { ICONS } from '../data/constants.js'

export function Button({ children, onClick, disabled = false, variant = "primary", className = "" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
  const styles = variant === "outline"
    ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
    : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-500"
      : "bg-slate-900 text-white hover:bg-slate-700"

  return <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>{children}</button>
}

export function Panel({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
}

export function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${className}`}>{children}</span>
}

export function TinyIcon({ name, className = "" }) {
  return <span className={`inline-flex h-4 w-4 items-center justify-center leading-none ${className}`} aria-hidden="true">{ICONS[name] ?? name}</span>
}
