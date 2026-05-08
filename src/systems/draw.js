import { shuffle } from './utils.js'

export function drawCards(state, amount) {
  let drawPile = [...state.drawPile]
  let discard = [...state.discard]
  const hand = [...state.hand]
  const logs = []

  for (let i = 0; i < amount; i += 1) {
    if (hand.length >= 10) break

    if (drawPile.length === 0) {
      if (discard.length === 0) break
      drawPile = shuffle(discard)
      discard = []
      logs.push("弃牌堆洗入抽牌堆。")
    }

    const card = drawPile.shift()
    if (!card) break
    hand.push(card)
  }

  return { ...state, drawPile, discard, hand, log: [...state.log, ...logs] }
}
