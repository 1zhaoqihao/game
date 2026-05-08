export function reaction(existingAura, incomingElement) {
  if (!existingAura || incomingElement === "physical" || incomingElement === "geo") {
    return { name: null, multiplier: 1, bonusDamage: 0, status: null, consume: false }
  }

  const pair = [existingAura, incomingElement].sort().join("+")

  if ((existingAura === "pyro" && incomingElement === "hydro") || (existingAura === "hydro" && incomingElement === "pyro")) {
    return { name: "蒸发", multiplier: incomingElement === "hydro" ? 2 : 1.5, bonusDamage: 0, status: null, consume: true }
  }

  if ((existingAura === "pyro" && incomingElement === "cryo") || (existingAura === "cryo" && incomingElement === "pyro")) {
    return { name: "融化", multiplier: incomingElement === "pyro" ? 2 : 1.5, bonusDamage: 0, status: null, consume: true }
  }

  if (pair === "electro+pyro") {
    return { name: "超载", multiplier: 1, bonusDamage: 10, status: null, consume: true }
  }

  if (pair === "cryo+hydro") {
    return { name: "冻结", multiplier: 1, bonusDamage: 0, status: "frozen", consume: true }
  }

  if (incomingElement === "anemo" && existingAura !== "anemo") {
    return { name: "扩散", multiplier: 1, bonusDamage: 5, status: null, consume: false }
  }

  return { name: null, multiplier: 1, bonusDamage: 0, status: null, consume: false }
}
