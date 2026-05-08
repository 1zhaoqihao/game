export const ENCOUNTERS = [
  {
    id: "slime_training",
    name: "元素史莱姆群",
    hp: 75,
    attack: 8,
    floorLabel: "第 1 战",
    moves: [
      { type: "attack", value: 8 },
      { type: "block", value: 5 },
      { type: "attack", value: 6 },
    ],
  },
  {
    id: "abyss_guard",
    name: "深渊守卫",
    hp: 100,
    attack: 11,
    floorLabel: "第 2 战",
    moves: [
      { type: "attack", value: 11 },
      { type: "attack_block", value: 8, block: 6 },
      { type: "attack", value: 14 },
    ],
  },
  {
    id: "elite_mage",
    name: "元素咏者",
    hp: 130,
    attack: 14,
    floorLabel: "精英战",
    moves: [
      { type: "attack", value: 14 },
      { type: "block", value: 10 },
      { type: "attack_block", value: 12, block: 8 },
    ],
  },
  {
    id: "boss_drake",
    name: "深渊元素龙",
    hp: 180,
    attack: 17,
    floorLabel: "Boss",
    moves: [
      { type: "attack", value: 17 },
      { type: "block", value: 14 },
      { type: "attack_block", value: 13, block: 10 },
      { type: "attack", value: 22 },
    ],
  },
]
