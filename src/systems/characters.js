import { drawCards } from './draw.js'

function hasTriggeredThisTurn(state, passiveId) {
  return state.passiveMemory?.turn === state.turn && state.passiveMemory?.ids?.includes(passiveId)
}

function markTriggered(state, passiveId) {
  const sameTurn = state.passiveMemory?.turn === state.turn
  return {
    ...state,
    passiveMemory: {
      turn: state.turn,
      ids: sameTurn ? [...state.passiveMemory.ids, passiveId] : [passiveId],
    },
  }
}

export function triggerCharacterPassive(state, event) {
  const passive = state.character?.passive
  if (!passive || passive.trigger !== event.type) return { state, logs: [] }
  if (passive.reaction && passive.reaction !== event.reaction) return { state, logs: [] }
  if (passive.effect?.oncePerTurn && hasTriggeredThisTurn(state, passive.id)) return { state, logs: [] }

  let next = state
  const logs = []
  const effect = passive.effect

  if (effect.type === "draw") {
    const before = next.hand.length
    next = drawCards(next, effect.amount)
    logs.push(`${state.character.name} 被动触发：抽 ${next.hand.length - before} 张牌。`)
  }

  if (effect.type === "gain_block") {
    next = { ...next, player: { ...next.player, block: next.player.block + effect.amount } }
    logs.push(`${state.character.name} 被动触发：获得 ${effect.amount} 点护盾。`)
  }

  if (effect.type === "heal") {
    const player = { ...next.player }
    const before = player.hp
    player.hp = Math.min(player.maxHp, player.hp + effect.amount)
    next = { ...next, player }
    logs.push(`${state.character.name} 被动触发：恢复 ${player.hp - before} 点生命。`)
  }

  if (effect.oncePerTurn) next = markTriggered(next, passive.id)
  return { state: next, logs }
}
