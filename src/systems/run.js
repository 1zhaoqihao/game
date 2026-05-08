import { getCardById } from '../data/cards.js'
import { ENCOUNTERS } from '../data/encounters.js'
import { STARTER_RELICS } from '../data/relics.js'
import { getCharacter } from '../data/characters.js'
import { shuffle, makeInstance } from './utils.js'
import { relicInstance, triggerRelics } from './relics.js'
import { chooseEnemyIntent } from './intent.js'
import { triggerCharacterPassive } from './characters.js'

export function buildEnemy(index) {
  const encounter = ENCOUNTERS[Math.min(index, ENCOUNTERS.length - 1)]
  return {
    name: encounter.name,
    hp: encounter.hp,
    maxHp: encounter.hp,
    block: 0,
    aura: null,
    frozen: 0,
    statuses: {},
    intent: chooseEnemyIntent(index, 1),
  }
}

export function createRun(characterId = "pyro_swordsman") {
  const character = getCharacter(characterId)
  const masterDeck = character.starterDeck.map((cardId) => makeInstance(getCardById(cardId)))
  const deck = shuffle(masterDeck.map(makeInstance))
  const relics = STARTER_RELICS.map(relicInstance)

  const run = {
    phase: "combat",
    encounterIndex: 0,
    turn: 1,
    energy: character.maxEnergy,
    maxEnergy: character.maxEnergy,
    gold: 0,
    character,
    passiveMemory: { turn: 1, ids: [] },
    player: { hp: character.maxHp, maxHp: character.maxHp, block: 0, energyBurst: 0, statuses: {} },
    enemy: buildEnemy(0),
    masterDeck,
    drawPile: deck.slice(5),
    hand: deck.slice(0, 5),
    discard: [],
    exhausted: [],
    summons: [],
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

  const passive = triggerCharacterPassive(run, { type: "onCombatStart" })
  const triggered = triggerRelics(passive.state, { type: "onCombatStart" })
  return { ...triggered.state, log: [...triggered.state.log, ...passive.logs, ...triggered.logs].slice(-22) }
}
