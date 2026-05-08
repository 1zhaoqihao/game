import { STARTER_DECK } from '../data/cards.js'
import { ENCOUNTERS } from '../data/encounters.js'
import { STARTER_RELICS } from '../data/relics.js'
import { shuffle, makeInstance } from './utils.js'
import { relicInstance, triggerRelics } from './relics.js'
import { chooseEnemyIntent } from './intent.js'

export function buildEnemy(index) {
  const encounter = ENCOUNTERS[Math.min(index, ENCOUNTERS.length - 1)]
  return {
    name: encounter.name,
    hp: encounter.hp,
    maxHp: encounter.hp,
    block: 0,
    aura: null,
    frozen: 0,
    intent: chooseEnemyIntent(index, 1),
  }
}

export function createRun() {
  const masterDeck = STARTER_DECK.map(makeInstance)
  const deck = shuffle(masterDeck.map(makeInstance))
  const relics = STARTER_RELICS.map(relicInstance)

  const run = {
    phase: "combat",
    encounterIndex: 0,
    turn: 1,
    energy: 3,
    maxEnergy: 3,
    gold: 0,
    player: { hp: 72, maxHp: 72, block: 0, energyBurst: 0 },
    enemy: buildEnemy(0),
    masterDeck,
    drawPile: deck.slice(5),
    hand: deck.slice(0, 5),
    discard: [],
    exhausted: [],
    rewards: [],
    rewardRelic: null,
    rewardGold: 0,
    currentEvent: null,
    pendingNextIndex: null,
    shopInventory: null,
    chestReward: null,
    relics,
    mapChoices: [],
    log: ["战斗开始：验证元素反应构筑。"],
    won: false,
    lost: false,
    runComplete: false,
  }

  const triggered = triggerRelics(run, { type: "onCombatStart" })
  return { ...triggered.state, log: [...triggered.state.log, ...triggered.logs].slice(-22) }
}
