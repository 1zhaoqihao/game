export function addStatus(actor, statusId, turns) {
  return {
    ...actor,
    statuses: {
      ...(actor.statuses ?? {}),
      [statusId]: Math.max(actor.statuses?.[statusId] ?? 0, turns),
    },
  }
}

export function hasStatus(actor, statusId) {
  return (actor.statuses?.[statusId] ?? 0) > 0
}

export function tickStatuses(actor) {
  const nextStatuses = {}
  for (const [statusId, turns] of Object.entries(actor.statuses ?? {})) {
    if (turns > 1) nextStatuses[statusId] = turns - 1
  }
  return { ...actor, statuses: nextStatuses }
}

export function statusEntries(actor) {
  return Object.entries(actor.statuses ?? {}).filter(([, turns]) => turns > 0)
}
