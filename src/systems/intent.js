import { ENCOUNTERS } from '../data/encounters.js'
import { addStatus, hasStatus, tickStatuses } from './status.js'

export function chooseEnemyIntent(encounterIndex, turn) {
  const encounter = ENCOUNTERS[Math.min(encounterIndex, ENCOUNTERS.length - 1)]
  const moves = encounter.moves?.length ? encounter.moves : [{ type: "attack", value: encounter.attack }]
  const move = moves[(Math.max(1, turn) - 1) % moves.length]

  return {
    type: move.type,
    value: move.value ?? 0,
    block: move.block ?? 0,
    status: move.status ?? null,
    turns: move.turns ?? 0,
  }
}

export function describeIntent(intent) {
  if (intent.type === "block") return `防御 ${intent.value}`
  if (intent.type === "attack_block") return `攻击 ${intent.value} / 防御 ${intent.block}`
  if (intent.type === "status") return `施加 ${intent.status}`
  return `攻击 ${intent.value}`
}

export function resolveEnemyIntent(state) {
  let player = { ...state.player }
  let enemy = { ...state.enemy }
  const logs = []

  if (enemy.frozen > 0) {
    enemy.frozen -= 1
    logs.push("敌人被冻结，跳过行动。")
    return { state: { ...state, player, enemy }, logs }
  }

  const intent = enemy.intent
  if (intent.type === "attack" || intent.type === "attack_block") {
    const raw = Math.max(0, Math.round(intent.value * (hasStatus(enemy, "weak") ? 0.75 : 1)))
    const absorbed = Math.min(player.block, raw)
    player.block -= absorbed
    const taken = raw - absorbed
    player.hp = Math.max(0, player.hp - taken)
    logs.push(`敌人攻击 ${raw} 点，护盾抵消 ${absorbed}，受到 ${taken} 点伤害。`)
  }

  if (intent.type === "block") {
    enemy.block += intent.value
    logs.push(`敌人获得 ${intent.value} 点护盾。`)
  }

  if (intent.type === "attack_block") {
    enemy.block += intent.block
    logs.push(`敌人追加获得 ${intent.block} 点护盾。`)
  }

  if (intent.type === "status") {
    player = addStatus(player, intent.status, intent.turns || 1)
    logs.push(`敌人施加 ${intent.turns || 1} 回合${intent.status}。`)
  }

  return { state: { ...state, player, enemy: tickStatuses(enemy) }, logs }
}
