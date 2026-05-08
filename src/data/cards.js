export const STARTER_DECK = [
  { id: "strike_1", name: "斩击", cost: 1, type: "攻击", element: "physical", damage: 6, block: 0, text: "造成 6 点物理伤害。" },
  { id: "strike_2", name: "斩击", cost: 1, type: "攻击", element: "physical", damage: 6, block: 0, text: "造成 6 点物理伤害。" },
  { id: "defend_1", name: "格挡", cost: 1, type: "技能", element: "physical", damage: 0, block: 5, text: "获得 5 点护盾。" },
  { id: "defend_2", name: "格挡", cost: 1, type: "技能", element: "physical", damage: 0, block: 5, text: "获得 5 点护盾。" },
  { id: "pyro_slash", name: "炽焰斩", cost: 1, type: "攻击", element: "pyro", damage: 8, block: 0, apply: "pyro", text: "造成 8 点火伤，并附着火。" },
  { id: "water_blade", name: "潮汐刃", cost: 1, type: "攻击", element: "hydro", damage: 7, block: 0, apply: "hydro", text: "造成 7 点水伤，并附着水。" },
  { id: "frost_arrow", name: "霜华矢", cost: 1, type: "攻击", element: "cryo", damage: 7, block: 0, apply: "cryo", text: "造成 7 点冰伤，并附着冰。" },
  { id: "thunder_jab", name: "雷枪突刺", cost: 1, type: "攻击", element: "electro", damage: 6, block: 0, apply: "electro", text: "造成 6 点雷伤，并附着雷。" },
  { id: "wind_song", name: "风息诗", cost: 1, type: "技能", element: "anemo", damage: 4, block: 3, apply: "anemo", text: "造成 4 点风伤，获得 3 护盾；若目标有元素则扩散。" },
  { id: "burst", name: "元素爆发", cost: 2, type: "爆发", element: "pyro", damage: 16, block: 0, apply: "pyro", text: "造成 16 点火伤，并附着火。" },
]

export const REWARD_CARD_POOL = [
  { id: "flame_combo", name: "烈焰连斩", cost: 1, type: "攻击", element: "pyro", damage: 5, hits: 2, block: 0, apply: "pyro", rarity: "普通", text: "造成 2 次 5 点火伤，并附着火。" },
  { id: "tidal_guard", name: "潮汐护壁", cost: 1, type: "技能", element: "hydro", damage: 0, block: 8, apply: "hydro", rarity: "普通", text: "获得 8 护盾，并给敌人附着水。" },
  { id: "ice_prison", name: "冰棱牢笼", cost: 2, type: "技能", element: "cryo", damage: 5, block: 6, apply: "cryo", rarity: "非凡", text: "造成 5 冰伤，获得 6 护盾，并附着冰。" },
  { id: "thunder_chain", name: "雷链", cost: 1, type: "攻击", element: "electro", damage: 9, block: 0, apply: "electro", rarity: "非凡", text: "造成 9 雷伤，并附着雷。" },
  { id: "storm_eye", name: "风暴之眼", cost: 2, type: "攻击", element: "anemo", damage: 10, block: 0, apply: "anemo", rarity: "稀有", text: "造成 10 风伤；若目标有元素，扩散并额外造成伤害。" },
  { id: "molten_burst", name: "熔火爆发", cost: 2, type: "爆发", element: "pyro", damage: 22, block: 0, apply: "pyro", rarity: "稀有", text: "造成 22 火伤，并附着火。适合融化/蒸发。" },
  { id: "glacier_cut", name: "冰川切", cost: 1, type: "攻击", element: "cryo", damage: 8, block: 0, apply: "cryo", rarity: "普通", text: "造成 8 冰伤，并附着冰。" },
  { id: "spring_heal", name: "泉涌", cost: 1, type: "技能", element: "hydro", damage: 0, block: 4, heal: 4, apply: "hydro", rarity: "非凡", text: "恢复 4 生命，获得 4 护盾，并附着水。" },
  { id: "crystal_skin", name: "结晶皮肤", cost: 1, type: "技能", element: "geo", damage: 0, block: 11, apply: "geo", rarity: "普通", text: "获得 11 护盾。岩元素暂不反应，但防御很强。" },
  { id: "quick_draw", name: "元素观测", cost: 0, type: "技能", element: "physical", damage: 0, block: 0, draw: 2, rarity: "稀有", text: "抽 2 张牌。" },
  { id: "overload_spark", name: "爆雷火花", cost: 1, type: "攻击", element: "pyro", damage: 6, block: 0, apply: "pyro", rarity: "非凡", text: "造成 6 火伤并附着火。若目标带雷，可触发超载。" },
  { id: "frost_deflect", name: "霜盾反射", cost: 1, type: "技能", element: "cryo", damage: 3, block: 9, apply: "cryo", rarity: "非凡", text: "造成 3 冰伤，获得 9 护盾，并附着冰。" },
  { id: "expose_weakness", name: "破绽标记", cost: 1, type: "技能", element: "physical", rarity: "非凡", text: "给予敌人 2 回合易伤。", effects: [{ type: "apply_status", status: "vulnerable", turns: 2, label: "易伤" }] },
  { id: "mist_veil", name: "雾潮帷幕", cost: 1, type: "技能", element: "hydro", block: 6, rarity: "普通", text: "获得 6 护盾，给予敌人 2 回合虚弱。", effects: [{ type: "gain_block", amount: 6 }, { type: "apply_status", status: "weak", turns: 2, label: "虚弱" }] },
]

export const ALL_CARDS = [...STARTER_DECK, ...REWARD_CARD_POOL]

export function getCardById(id) {
  return ALL_CARDS.find((card) => card.id === id) ?? STARTER_DECK[0]
}
