import { ELEMENTS } from '../data/constants.js'
import { reaction } from './reaction.js'

export function addSummon(state, summon) {
  return {
    ...state,
    summons: [
      ...(state.summons ?? []),
      {
        uid: `${summon.id}_${Math.random().toString(36).slice(2)}`,
        id: summon.id,
        name: summon.name,
        element: summon.element,
        damage: summon.damage,
        turns: summon.turns,
      },
    ],
  }
}

export function triggerSummons(state) {
  let enemy = { ...state.enemy }
  const logs = []
  const nextSummons = []

  for (const summon of state.summons ?? []) {
    if (summon.turns <= 0 || enemy.hp <= 0) continue

    const reactionResult = reaction(enemy.aura, summon.element)
    const damage = Math.round(summon.damage * reactionResult.multiplier + reactionResult.bonusDamage)
    const blocked = Math.min(enemy.block ?? 0, damage)
    enemy.block = Math.max(0, (enemy.block ?? 0) - blocked)
    enemy.hp = Math.max(0, enemy.hp - (damage - blocked))

    logs.push(`${summon.name} 造成 ${damage - blocked} 点${ELEMENTS[summon.element]?.label ?? ""}伤害。`)
    if (blocked > 0) logs.push(`敌人护盾抵消 ${blocked} 点召唤伤害。`)
    if (reactionResult.name) logs.push(`${summon.name} 触发元素反应：${reactionResult.name}。`)
    if (reactionResult.status === "frozen") enemy.frozen = 1

    if (summon.element !== "anemo" && summon.element !== "geo") {
      enemy.aura = reactionResult.consume ? null : summon.element
    }

    const remaining = summon.turns - 1
    if (remaining > 0) nextSummons.push({ ...summon, turns: remaining })
  }

  return { state: { ...state, enemy, summons: nextSummons }, logs }
}
