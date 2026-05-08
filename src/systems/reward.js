import { REWARD_CARD_POOL } from '../data/cards.js'
import { RELIC_POOL } from '../data/relics.js'
import { shuffle, makeInstance } from './utils.js'
import { relicInstance } from './relics.js'

export function generateRewards() {
  return {
    cards: shuffle(REWARD_CARD_POOL).slice(0, 3).map(makeInstance),
    relic: relicInstance(shuffle(RELIC_POOL)[0]),
    gold: 18 + Math.floor(Math.random() * 13),
  }
}

export function generateShopInventory() {
  return {
    cards: shuffle(REWARD_CARD_POOL).slice(0, 4).map((card) => ({ ...makeInstance(card), price: 32 + Math.floor(Math.random() * 18) })),
    relics: shuffle(RELIC_POOL).slice(0, 2).map((relic) => ({ ...relicInstance(relic), price: 70 + Math.floor(Math.random() * 31) })),
  }
}

export function generateChestReward() {
  return {
    gold: 30 + Math.floor(Math.random() * 31),
    relic: relicInstance(shuffle(RELIC_POOL)[0]),
  }
}

export function randomRewardCard() {
  return makeInstance(shuffle(REWARD_CARD_POOL)[0])
}

export function randomRewardRelic() {
  return relicInstance(shuffle(RELIC_POOL)[0])
}
