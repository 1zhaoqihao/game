import { Badge } from './ui.jsx'

export function RelicView({ relic, compact = false }) {
  if (!relic) return null

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50 text-amber-950 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-bold">{relic.icon} {relic.name}</div>
          <div className="mt-1 text-xs text-amber-800">{relic.trigger}</div>
        </div>
        <Badge className="shrink-0 border-amber-300 bg-white/80 text-amber-900">{relic.rarity}</Badge>
      </div>
      {!compact && <p className="mt-3 text-sm leading-relaxed text-amber-900">{relic.description}</p>}
    </div>
  )
}
