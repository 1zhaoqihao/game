import { ELEMENTS } from '../data/constants.js'
import { reaction } from './reaction.js'
import { drawCards } from './draw.js'
import { triggerRelics } from './relics.js'
import { triggerCharacterPassive } from './characters.js'

export function getCardEffects(card) {
  if (Array.isArray(card.effects) && card.effects.length > 0) return card.effects

  const effects = []
  if (card.block > 0) effects.push({ type: "gain_block", amount: card.block })
  if (card.heal > 0) effects.push({ type: "heal", amount: card.heal })
  if (card.draw > 0) effects.push({ type: "draw", amount: card.draw })
  if (card.damage > 0) {
    effects.push({
      type: "deal_damage",
      amount: card.damage,
      hits: card.hits || 1,
      element: card.element,
      apply: card.apply,
    })
  } else if (card.apply) {
    effects.push({ type: "apply_element", element: card.apply })
  }
  return effects
}

function applyAuraAfterHit(enemy, cardElement, applyElement, reactionResult, logs) {
  if (!applyElement) return enemy

  if (cardElement !== "anemo" && cardElement !== "geo") {
    const nextAura = reactionResult.consume ? null : applyElement
    const nextEnemy = { ...enemy, aura: nextAura }
    if (!reactionResult.consume) logs.push(`敌人附着 ${ELEMENTS[applyElement].label} 元素。`)
    return nextEnemy
  }

  if (applyElement === "anemo" && !reactionResult.name) {
    logs.push("风元素未找到可扩散元素。")
  }

  return enemy
}

function applyElementOnly(state, element, card, logs) {
  const incoming = element ?? card.element
  if (!incoming || incoming === "physical") return state

  let next = state
  let enemy = { ...next.enemy }
  let player = { ...next.player }
  const reactionResult = reaction(enemy.aura, incoming)

  if (reactionResult.name) logs.push(`触发元素反应：${reactionResult.name}！`)
  if (reactionResult.status === "frozen") {
    enemy.frozen = 1
    logs.push("敌人被冻结，下回合无法行动。")
  }

  enemy = applyAuraAfterHit(enemy, incoming, incoming, reactionResult, logs)
  if (reactionResult.consume && incoming !== "anemo" && incoming !== "geo" && enemy.hp > 0) {
    enemy = { ...enemy, aura: incoming }
    logs.push(`反应后重新附着 ${ELEMENTS[incoming].label} 元素。`)
  }

  next = { ...next, player, enemy }
  if (reactionResult.name) {
    const passive = triggerCharacterPassive(next, { type: "onReaction", reaction: reactionResult.name, card, enemyAura: enemy.aura })
    next = passive.state
    const triggered = triggerRelics(next, { type: "onReaction", reaction: reactionResult.name, card, enemyAura: enemy.aura })
    next = triggered.state
    logs.push(...passive.logs, ...triggered.logs)
  }
  return next
}

function applyDamageEffect(state, effect, card, logs) {
  let next = state
  let enemy = { ...next.enemy }
  let player = { ...next.player }
  const hitCount = effect.hits || 1
  const element = effect.element ?? card.element
  const applyElement = effect.apply ?? card.apply

  for (let hit = 0; hit < hitCount; hit += 1) {
    if (enemy.hp <= 0) break

    const reactionResult = reaction(enemy.aura, element)
    const rawDamage = Math.round(effect.amount * reactionResult.multiplier + reactionResult.bonusDamage)
    const blocked = Math.min(enemy.block ?? 0, rawDamage)
    const dmg = rawDamage - blocked
    enemy.block = Math.max(0, (enemy.block ?? 0) - blocked)
    enemy.hp = Math.max(0, enemy.hp - dmg)
    logs.push(`造成 ${dmg} 点${ELEMENTS[element]?.label ?? ""}伤害。`)
    if (blocked > 0) logs.push(`敌人护盾抵消 ${blocked} 点伤害。`)
    if (reactionResult.name) logs.push(`触发元素反应：${reactionResult.name}！`)

    if (reactionResult.status === "frozen") {
      enemy.frozen = 1
      logs.push("敌人被冻结，下回合无法行动。")
    }

    enemy = applyAuraAfterHit(enemy, element, applyElement, reactionResult, logs)
    if (reactionResult.consume && applyElement && element !== "anemo" && element !== "geo" && enemy.hp > 0) {
      enemy = { ...enemy, aura: applyElement }
      logs.push(`反应后重新附着 ${ELEMENTS[applyElement].label} 元素。`)
    }

    next = { ...next, player, enemy }
    if (reactionResult.name) {
      const passive = triggerCharacterPassive(next, { type: "onReaction", reaction: reactionResult.name, card, enemyAura: enemy.aura })
      next = passive.state
      const triggered = triggerRelics(next, { type: "onReaction", reaction: reactionResult.name, card, enemyAura: enemy.aura })
      next = triggered.state
      player = { ...next.player }
      enemy = { ...next.enemy }
      logs.push(...passive.logs, ...triggered.logs)
    }
  }

  return { ...next, player, enemy }
}

export function resolveCardEffects(state, card) {
  let next = state
  const logs = []

  for (const effect of getCardEffects(card)) {
    if (effect.type === "gain_block") {
      const player = { ...next.player, block: next.player.block + effect.amount }
      next = { ...next, player }
      logs.push(`获得 ${effect.amount} 点护盾。`)
    }

    if (effect.type === "heal") {
      const player = { ...next.player }
      const before = player.hp
      player.hp = Math.min(player.maxHp, player.hp + effect.amount)
      next = { ...next, player }
      logs.push(`恢复 ${player.hp - before} 点生命。`)
    }

    if (effect.type === "draw") {
      const before = next.hand.length
      next = drawCards(next, effect.amount)
      logs.push(`抽 ${next.hand.length - before} 张牌。`)
    }

    if (effect.type === "deal_damage") {
      next = applyDamageEffect(next, effect, card, logs)
    }

    if (effect.type === "apply_element") {
      next = applyElementOnly(next, effect.element, card, logs)
    }
  }

  return { state: next, logs }
}
