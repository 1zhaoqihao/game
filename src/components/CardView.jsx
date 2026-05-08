import { ELEMENTS } from '../data/constants.js'
import { Badge } from './ui.jsx'

export function CardView({ card, selected, disabled, onClick }) {
  const meta = ELEMENTS[card.element] || ELEMENTS.physical

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:opacity-40 ${selected ? "ring-2 ring-slate-900" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold">{card.cost}</div>
        <Badge className={`${meta.cls}`}><span>{meta.icon}</span>{meta.label}</Badge>
      </div>
      <div className="mt-4 text-lg font-bold">{card.name}</div>
      <div className="flex items-center gap-2 text-xs text-slate-500"><span>{card.type}</span>{card.rarity && <span>· {card.rarity}</span>}</div>
      <p className="mt-3 min-h-[52px] text-sm leading-relaxed text-slate-700">{card.text}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        {card.damage > 0 && <span>伤害 {card.hits ? `${card.damage}x${card.hits}` : card.damage}</span>}
        {card.block > 0 && <span>护盾 {card.block}</span>}
        {card.heal > 0 && <span>治疗 {card.heal}</span>}
        {card.draw > 0 && <span>抽牌 {card.draw}</span>}
      </div>
    </button>
  )
}
