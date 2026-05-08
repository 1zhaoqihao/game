import { reaction } from './reaction.js'
import { drawCards } from './draw.js'
import { generateChestReward, generateRewards, generateShopInventory } from './reward.js'
import { generateMapChoices } from './map.js'
import { triggerRelics } from './relics.js'
import { getCardEffects, resolveCardEffects } from './effects.js'
import { chooseEnemyIntent, resolveEnemyIntent } from './intent.js'
import { createRun } from './run.js'
import { CHARACTERS } from '../data/characters.js'
import { hasSavedRun, loadRun, saveRun } from './save.js'

export function runSelfTests() {
  const tests = []
  const add = (name, passed, detail = "") => tests.push({ name, passed, detail })

  add("水打火触发 2 倍蒸发", reaction("pyro", "hydro").name === "蒸发" && reaction("pyro", "hydro").multiplier === 2)
  add("火打水触发 1.5 倍蒸发", reaction("hydro", "pyro").name === "蒸发" && reaction("hydro", "pyro").multiplier === 1.5)
  add("火打冰触发 2 倍融化", reaction("cryo", "pyro").name === "融化" && reaction("cryo", "pyro").multiplier === 2)
  add("火雷触发超载并增加 10 伤害", reaction("electro", "pyro").name === "超载" && reaction("electro", "pyro").bonusDamage === 10)
  add("水冰触发冻结", reaction("hydro", "cryo").name === "冻结" && reaction("hydro", "cryo").status === "frozen")
  add("风打已有元素触发扩散", reaction("pyro", "anemo").name === "扩散" && reaction("pyro", "anemo").bonusDamage === 5)

  const dummyCards = [1, 2, 3, 4, 5, 6].map((n) => ({ uid: `test_${n}`, id: `test_${n}`, name: `测试牌${n}` }))
  const drawState = drawCards({ drawPile: dummyCards.slice(0, 2), discard: dummyCards.slice(2), hand: [], log: [] }, 5)
  add("抽牌堆不足时会洗入弃牌堆", drawState.hand.length === 5 && drawState.discard.length === 0, `hand=${drawState.hand.length}, discard=${drawState.discard.length}`)

  const capped = drawCards({ drawPile: dummyCards, discard: [], hand: dummyCards.slice(0, 9), log: [] }, 5)
  add("手牌上限为 10", capped.hand.length === 10, `hand=${capped.hand.length}`)

  add("无附着时不会触发元素反应", reaction(null, "pyro").name === null && reaction(null, "pyro").multiplier === 1)
  add("物理攻击不会触发元素反应", reaction("pyro", "physical").name === null && reaction("pyro", "physical").multiplier === 1)

  const emptyDraw = drawCards({ drawPile: [], discard: [], hand: [], log: [] }, 5)
  add("空抽牌堆和空弃牌堆不会报错", emptyDraw.hand.length === 0 && emptyDraw.drawPile.length === 0 && emptyDraw.discard.length === 0)

  const rewards = generateRewards()
  add("战斗奖励生成 3 张卡", rewards.cards.length === 3)
  add("战斗奖励金币为正数", rewards.gold > 0)
  add("战斗奖励会生成 1 件遗物", Boolean(rewards.relic?.id))
  add("地图分支至少提供 1 个下一步选择", generateMapChoices(0).length >= 1)
  add("地图会提供事件节点", generateMapChoices(0).some((choice) => choice.type === "event"))
  add("地图会提供商店节点", generateMapChoices(1).some((choice) => choice.type === "shop"))
  add("地图会提供宝箱节点", generateMapChoices(2).some((choice) => choice.type === "chest"))

  const shop = generateShopInventory()
  add("商店生成卡牌和遗物库存", shop.cards.length === 4 && shop.relics.length === 2 && shop.cards.every((card) => card.price > 0))

  const chest = generateChestReward()
  add("宝箱生成金币和遗物", chest.gold > 0 && Boolean(chest.relic?.id))

  const relicState = {
    maxEnergy: 3,
    energy: 1,
    player: { hp: 10, maxHp: 10, block: 0 },
    enemy: {},
    hand: [],
    drawPile: [],
    discard: [],
    log: [],
    relics: [{ id: "test_relic", name: "测试遗物", trigger: "onReaction", condition: { reaction: "蒸发" }, effect: { type: "gain_energy", amount: 1 } }],
  }
  const triggered = triggerRelics(relicState, { type: "onReaction", reaction: "蒸发" })
  add("遗物可响应元素反应触发", triggered.state.energy === 2 && triggered.logs.length === 1)

  const legacyEffects = getCardEffects({ damage: 6, block: 3, element: "pyro", apply: "pyro" })
  add("旧卡牌字段可转换为效果列表", legacyEffects.some((effect) => effect.type === "gain_block") && legacyEffects.some((effect) => effect.type === "deal_damage"))

  const effectCard = {
    id: "effect_test",
    name: "效果测试",
    cost: 1,
    element: "hydro",
    effects: [
      { type: "gain_block", amount: 2 },
      { type: "deal_damage", amount: 5, element: "hydro", apply: "hydro" },
    ],
  }
  const effectState = {
    maxEnergy: 3,
    energy: 2,
    player: { hp: 20, maxHp: 20, block: 0 },
    enemy: { hp: 20, maxHp: 20, aura: "pyro", frozen: 0 },
    hand: [],
    drawPile: [],
    discard: [],
    log: [],
    relics: [],
  }
  const resolved = resolveCardEffects(effectState, effectCard)
  add("数据驱动 effects 卡牌可直接结算", resolved.state.player.block === 2 && resolved.state.enemy.hp === 10)

  add("敌人意图会按回合轮换", chooseEnemyIntent(0, 2).type === "block")

  const enemyAction = resolveEnemyIntent({
    player: { hp: 20, maxHp: 20, block: 3 },
    enemy: { block: 0, frozen: 0, intent: { type: "attack_block", value: 8, block: 5 } },
  })
  add("敌人攻防混合意图可结算", enemyAction.state.player.hp === 15 && enemyAction.state.enemy.block === 5)

  const blockedDamage = resolveCardEffects({
    maxEnergy: 3,
    energy: 2,
    player: { hp: 20, maxHp: 20, block: 0 },
    enemy: { hp: 20, maxHp: 20, block: 4, aura: null, frozen: 0 },
    hand: [],
    drawPile: [],
    discard: [],
    log: [],
    relics: [],
  }, { id: "block_test", name: "破盾测试", cost: 1, element: "physical", effects: [{ type: "deal_damage", amount: 6, element: "physical" }] })
  add("敌人护盾会抵消玩家伤害", blockedDamage.state.enemy.hp === 18 && blockedDamage.state.enemy.block === 0)

  add("角色数据至少提供 3 个原型", CHARACTERS.length >= 3)
  const cryoRun = createRun("cryo_archer")
  add("创建 run 会套用角色生命与初始卡组", cryoRun.character.id === "cryo_archer" && cryoRun.player.maxHp === 72 && cryoRun.masterDeck.length === 10)

  const pyroPassiveState = {
    ...createRun("pyro_swordsman"),
    hand: [],
    drawPile: dummyCards.slice(0, 2),
    discard: [],
    enemy: { hp: 20, maxHp: 20, block: 0, aura: "pyro", frozen: 0 },
  }
  const passiveResolved = resolveCardEffects(pyroPassiveState, { id: "passive_test", name: "被动测试", cost: 1, element: "hydro", effects: [{ type: "deal_damage", amount: 1, element: "hydro", apply: "hydro" }] })
  add("角色被动可响应元素反应", passiveResolved.state.hand.length === 1)

  add("非浏览器环境下存档模块安全降级", saveRun({}) === false && loadRun() === null && hasSavedRun() === false)

  return tests
}
