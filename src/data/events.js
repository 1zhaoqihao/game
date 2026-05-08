import { ICONS } from './constants.js'

export const EVENT_POOL = [
  {
    id: "ancient_statue",
    title: "古老神像",
    icon: ICONS.energy,
    description: "一座残破的七元素神像散发微光，似乎仍在回应旅人的选择。",
    choices: [
      {
        id: "offer_gold",
        text: "献上 35 金币，获得随机遗物",
        cost: { gold: 35 },
        reward: { relic: true },
      },
      {
        id: "take_power",
        text: "失去 5 点生命上限，获得 60 金币",
        cost: { maxHp: 5 },
        reward: { gold: 60 },
      },
      {
        id: "leave",
        text: "离开",
        cost: {},
        reward: {},
      },
    ],
  },
  {
    id: "wandering_alchemist",
    title: "流浪炼金术士",
    icon: ICONS.hydro,
    description: "炼金术士愿意用一瓶临时药剂交换你的冒险故事。",
    choices: [
      {
        id: "buy_heal",
        text: "支付 25 金币，恢复 18 生命",
        cost: { gold: 25 },
        reward: { heal: 18 },
      },
      {
        id: "test_potion",
        text: "试饮不稳定药剂，获得 1 张随机卡，失去 6 生命",
        cost: { hp: 6 },
        reward: { card: true },
      },
      {
        id: "leave",
        text: "离开",
        cost: {},
        reward: {},
      },
    ],
  },
]
