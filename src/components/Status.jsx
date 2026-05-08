import { ELEMENTS } from '../data/constants.js'
import { Badge, TinyIcon } from './ui.jsx'

export function ElementBadge({ element }) {
  if (!element) return <Badge className="border-slate-200 bg-white text-slate-500">无附着</Badge>
  const meta = ELEMENTS[element]
  return <Badge className={`${meta.cls}`}><span>{meta.icon}</span>{meta.label}</Badge>
}

export function StatPill({ icon, label, value }) {
  return <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm shadow-sm"><TinyIcon name={icon} /><span>{label}</span><b>{value}</b></div>
}
