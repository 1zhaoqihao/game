import { ICONS } from './constants.js'

export const STARTER_RELICS = [
  {
    id: "spark_charm",
    name: "微光神之眼",
    rarity: "初始",
    icon: ICONS.energy,
    trigger: "onCombatStart",
    description: "每场战斗开始时获得 1 点护盾。",
    effect: { type: "gain_block", amount: 1 },
  },
]

export const RELIC_POOL = [
  {
    id: "crimson_cup",
    name: "赤焰之杯",
    rarity: "稀有",
    icon: ICONS.pyro,
    trigger: "onReaction",
    condition: { reaction: "蒸发" },
    description: "每当触发蒸发，获得 1 点费用。",
    effect: { type: "gain_energy", amount: 1 },
  },
  {
    id: "frost_lens",
    name: "霜镜",
    rarity: "非凡",
    icon: ICONS.cryo,
    trigger: "onReaction",
    condition: { reaction: "冻结" },
    description: "每当触发冻结，获得 4 点护盾。",
    effect: { type: "gain_block", amount: 4 },
  },
  {
    id: "storm_feather",
    name: "风暴羽饰",
    rarity: "普通",
    icon: ICONS.anemo,
    trigger: "onTurnStart",
    description: "每回合开始时，若敌人已有元素附着，抽 1 张牌。",
    effect: { type: "draw", amount: 1, requiresEnemyAura: true },
  },
  {
    id: "traveler_coin",
    name: "旅者金币",
    rarity: "普通",
    icon: ICONS.gold,
    trigger: "onVictory",
    description: "战斗胜利后额外获得 8 金币。",
    effect: { type: "gain_gold", amount: 8 },
  },
  {
    id: "guardian_stone",
    name: "守护石心",
    rarity: "非凡",
    icon: ICONS.geo,
    trigger: "onCombatStart",
    description: "每场战斗开始时获得 5 点护盾。",
    effect: { type: "gain_block", amount: 5 },
  },
  {
    id: "tide_shell",
    name: "潮汐贝",
    rarity: "稀有",
    icon: ICONS.hydro,
    trigger: "onVictory",
    description: "战斗胜利后恢复 3 点生命。",
    effect: { type: "heal", amount: 3 },
  },
]
