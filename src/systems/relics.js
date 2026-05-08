import { drawCards } from './draw.js'

export function relicInstance(relic) {
  return { ...relic, uid: `${relic.id}_${Math.random().toString(36).slice(2)}` }
}

function canTrigger(relic, event) {
  if (relic.trigger !== event.type) return false
  if (relic.condition?.reaction && relic.condition.reaction !== event.reaction) return false
  if (relic.effect?.requiresEnemyAura && !event.enemyAura) return false
  return true
}

function applyRelicEffect(state, relic, logs) {
  const effect = relic.effect
  if (!effect) return state

  if (effect.type === "gain_energy") {
    const nextEnergy = Math.min(state.maxEnergy + 2, state.energy + effect.amount)
    logs.push(`${relic.name} 触发：获得 ${nextEnergy - state.energy} 点费用。`)
    return { ...state, energy: nextEnergy }
  }

  if (effect.type === "gain_block") {
    const player = { ...state.player, block: state.player.block + effect.amount }
    logs.push(`${relic.name} 触发：获得 ${effect.amount} 点护盾。`)
    return { ...state, player }
  }

  if (effect.type === "draw") {
    const before = state.hand.length
    const next = drawCards(state, effect.amount)
    logs.push(`${relic.name} 触发：抽 ${next.hand.length - before} 张牌。`)
    return next
  }

  if (effect.type === "gain_gold") {
    logs.push(`${relic.name} 触发：额外获得 ${effect.amount} 金币。`)
    return { ...state, gold: state.gold + effect.amount }
  }

  if (effect.type === "heal") {
    const player = { ...state.player }
    const before = player.hp
    player.hp = Math.min(player.maxHp, player.hp + effect.amount)
    logs.push(`${relic.name} 触发：恢复 ${player.hp - before} 点生命。`)
    return { ...state, player }
  }

  return state
}

export function triggerRelics(state, event) {
  let next = state
  const logs = []

  for (const relic of state.relics ?? []) {
    if (canTrigger(relic, event)) {
      next = applyRelicEffect(next, relic, logs)
    }
  }

  return { state: next, logs }
}
