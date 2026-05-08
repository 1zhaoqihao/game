export const CHARACTERS = [
  {
    id: "pyro_swordsman",
    name: "炎刃剑士",
    element: "pyro",
    maxHp: 80,
    maxEnergy: 3,
    starterDeck: ["strike_1", "strike_2", "defend_1", "defend_2", "pyro_slash", "pyro_slash", "water_blade", "frost_arrow", "wind_song", "burst"],
    passive: {
      id: "pyro_first_reaction_draw",
      trigger: "onReaction",
      description: "每回合第一次触发元素反应时，抽 1 张牌。",
      effect: { type: "draw", amount: 1, oncePerTurn: true },
    },
  },
  {
    id: "cryo_archer",
    name: "寒霜弓手",
    element: "cryo",
    maxHp: 72,
    maxEnergy: 3,
    starterDeck: ["strike_1", "strike_2", "defend_1", "defend_2", "frost_arrow", "frost_arrow", "water_blade", "thunder_jab", "wind_song", "quick_draw"],
    passive: {
      id: "cryo_freeze_block",
      trigger: "onReaction",
      reaction: "冻结",
      description: "每当触发冻结，获得 3 点护盾。",
      effect: { type: "gain_block", amount: 3 },
    },
  },
  {
    id: "tide_mage",
    name: "潮汐法师",
    element: "hydro",
    maxHp: 76,
    maxEnergy: 3,
    starterDeck: ["strike_1", "strike_2", "defend_1", "defend_2", "water_blade", "water_blade", "pyro_slash", "frost_arrow", "spring_heal", "quick_draw"],
    passive: {
      id: "hydro_combat_heal",
      trigger: "onCombatStart",
      description: "每场战斗开始时恢复 2 点生命。",
      effect: { type: "heal", amount: 2 },
    },
  },
]

export function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0]
}
