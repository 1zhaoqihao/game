import { ICONS } from '../data/constants.js'
import { ENCOUNTERS } from '../data/encounters.js'
import { Badge, Panel, TinyIcon } from './ui.jsx'

const PHASE_LABEL = {
  combat: "战斗中",
  reward: "奖励",
  map: "路线选择",
  event: "事件",
  shop: "商店",
  rest: "休息",
  chest: "宝箱",
  complete: "已通关",
}

function getNodeIcon(index) {
  if (index === ENCOUNTERS.length - 1) return ICONS.boss
  if (ENCOUNTERS[index]?.id?.includes("elite")) return ICONS.elite
  return ICONS.swords
}

export function MiniMap({ phase, encounterIndex, mapChoices = [], runComplete = false }) {
  const selectableIndexes = new Set(phase === "map" ? mapChoices.map((choice) => choice.nextIndex) : [])
  const completedIndex = runComplete ? ENCOUNTERS.length - 1 : phase === "map" || phase === "reward" ? encounterIndex : encounterIndex - 1
  const progressValue = runComplete ? ENCOUNTERS.length : Math.min(ENCOUNTERS.length, encounterIndex + 1)
  const progressText = `${progressValue}/${ENCOUNTERS.length}`

  return (
    <Panel className="overflow-hidden p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TinyIcon name="map" />
          <h2 className="font-bold">小地图</h2>
          <Badge className="border-slate-300 bg-white text-slate-700">进度 {progressText}</Badge>
        </div>
        <Badge className={phase === "map" ? "border-amber-500 bg-amber-100 text-amber-800" : "border-slate-300 bg-slate-50 text-slate-700"}>
          {PHASE_LABEL[phase] ?? "探索中"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {ENCOUNTERS.map((encounter, index) => {
          const isCompleted = index <= completedIndex && !runComplete ? true : runComplete
          const isCurrent = !runComplete && phase === "combat" && index === encounterIndex
          const isSelectable = selectableIndexes.has(index)
          const isFuture = !isCompleted && !isCurrent && !isSelectable
          const nodeClass = isCurrent
            ? "border-slate-900 bg-slate-900 text-white shadow-md"
            : isSelectable
              ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-200"
              : isCompleted
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white text-slate-600"

          const branchChoices = phase === "map" ? mapChoices.filter((choice) => choice.nextIndex === index) : []

          return (
            <div key={encounter.id} className="relative min-w-0">
              {index > 0 && <div className="absolute -left-3 top-7 hidden h-px w-3 bg-slate-300 md:block" />}
              <div className={`min-h-[112px] rounded-xl border p-3 transition ${nodeClass}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold opacity-75">{encounter.floorLabel}</div>
                    <div className="mt-1 truncate text-sm font-bold">{encounter.name}</div>
                  </div>
                  <div className="shrink-0 text-xl leading-none">{isCompleted ? ICONS.check : getNodeIcon(index)}</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {isCompleted && <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">已完成</span>}
                  {isCurrent && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">当前战斗</span>}
                  {isSelectable && <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">可选</span>}
                  {isFuture && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">后续节点</span>}
                </div>

                {branchChoices.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {branchChoices.map((choice) => (
                      <div key={choice.id} className="flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-amber-900">
                        <span>{choice.icon}</span>
                        <span className="truncate">{choice.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
