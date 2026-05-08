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
