import { ENCOUNTERS } from '../data/encounters.js'
import { ICONS } from '../data/constants.js'

export function generateMapChoices(encounterIndex) {
  const next = encounterIndex + 1
  if (next >= ENCOUNTERS.length) return []

  const normal = { id: "normal", label: ENCOUNTERS[next].floorLabel, type: "combat", icon: ICONS.swords, heal: 0, nextIndex: next }
  const rest = { id: "rest", label: "休息后前进", type: "rest", icon: ICONS.rest, heal: 14, nextIndex: next }
  const elite = { id: "elite", label: next === 2 ? "挑战精英" : "强敌路线", type: "elite", icon: ICONS.elite, heal: 0, nextIndex: Math.min(next + 1, ENCOUNTERS.length - 1) }

  if (encounterIndex === 0) return [normal, rest]
  if (encounterIndex === 1) return [normal, elite, rest]
  return [normal]
}
