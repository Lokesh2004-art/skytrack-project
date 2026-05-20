export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts?.length) return null

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-[2200] flex w-[320px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            t.tone === 'warning'
              ? 'pointer-events-auto rounded-2xl border border-orange-200/25 bg-[#0B0F19]/80 p-3 shadow-glow backdrop-blur'
              : 'pointer-events-auto rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-3 shadow-glow backdrop-blur'
          }
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white/85">{t.title}</div>
              <div className="mt-0.5 text-xs text-white/60">{t.message}</div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
              onClick={() => onDismiss?.(t.id)}
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
