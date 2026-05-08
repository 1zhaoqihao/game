import { useMemo, useState } from 'react'
import { ICONS, ELEMENTS } from './data/constants.js'
import { ENCOUNTERS } from './data/encounters.js'
import { EVENT_POOL } from './data/events.js'
import { CHARACTERS } from './data/characters.js'
import { makeInstance, shuffle } from './systems/utils.js'
import { drawCards } from './systems/draw.js'
import { generateChestReward, generateRewards, generateShopInventory, randomRewardCard, randomRewardRelic } from './systems/reward.js'
import { generateMapChoices } from './systems/map.js'
import { buildEnemy, createRun } from './systems/run.js'
import { runSelfTests } from './systems/tests.js'
import { triggerRelics } from './systems/relics.js'
import { resolveCardEffects } from './systems/effects.js'
import { chooseEnemyIntent, describeIntent, resolveEnemyIntent } from './systems/intent.js'
import { triggerCharacterPassive } from './systems/characters.js'
import { Button, Panel, Badge, TinyIcon } from './components/ui.jsx'
import { CardView } from './components/CardView.jsx'
import { ElementBadge, StatPill } from './components/Status.jsx'
import { MiniMap } from './components/MiniMap.jsx'
import { RelicView } from './components/RelicView.jsx'

export default function App() {
  const [state, setState] = useState(() => createRun())
  const [selected, setSelected] = useState(null)
  const [showTests, setShowTests] = useState(false)
  const [showDeck, setShowDeck] = useState(false)
  const [showCharacters, setShowCharacters] = useState(false)

  const tests = useMemo(() => runSelfTests(), [])
  const passedCount = tests.filter((test) => test.passed).length
  const allTestsPassed = tests.every((test) => test.passed)
  const enemyHpPct = Math.max(0, Math.min(100, (state.enemy.hp / state.enemy.maxHp) * 100))
  const playerHpPct = Math.max(0, Math.min(100, (state.player.hp / state.player.maxHp) * 100))
  const currentEncounter = ENCOUNTERS[Math.min(state.encounterIndex, ENCOUNTERS.length - 1)]

  const playCard = (card) => {
    if (!card || state.phase !== "combat" || state.won || state.lost || card.cost > state.energy) return

    setState((s) => {
      let next = { ...s, energy: s.energy - card.cost }
      const logs = [`打出「${card.name}」。`]
      const resolved = resolveCardEffects(next, card)
      next = resolved.state
      logs.push(...resolved.logs)
      let enemy = { ...next.enemy }
      let player = { ...next.player }

      const hand = next.hand.filter((item) => item.uid !== card.uid)
      const discard = [...next.discard, card]
      const won = enemy.hp <= 0
      let phase = next.phase
      let rewards = next.rewards
      let rewardRelic = next.rewardRelic
      let rewardGold = next.rewardGold
      let mapChoices = next.mapChoices
      let runComplete = next.runComplete

      if (won) {
        next = { ...next, player, enemy }
        const triggered = triggerRelics(next, { type: "onVictory" })
        next = triggered.state
        player = { ...next.player }
        enemy = { ...next.enemy }
        logs.push(...triggered.logs)

        if (next.encounterIndex >= ENCOUNTERS.length - 1) {
          phase = "complete"
          runComplete = true
          logs.push("Boss 被击败！这条 Demo 路线通关。")
        } else {
          const generated = generateRewards()
          phase = "reward"
          rewards = generated.cards
          rewardRelic = generated.relic
          rewardGold = generated.gold
          mapChoices = []
          logs.push(`胜利！获得 ${generated.gold} 金币，并发现 3 张卡牌与 1 件遗物。`)
        }
      }

      return { ...next, phase, player, enemy, hand, discard, won, rewards, rewardRelic, rewardGold, mapChoices, runComplete, log: [...next.log, ...logs].slice(-22) }
    })

    setSelected(null)
  }

  const endTurn = () => {
    if (state.phase !== "combat" || state.won || state.lost) return

    setState((s) => {
      const logs = ["玩家结束回合。"]
      const resolvedIntent = resolveEnemyIntent(s)
      let player = { ...resolvedIntent.state.player }
      let enemy = { ...resolvedIntent.state.enemy }
      logs.push(...resolvedIntent.logs)

      const lost = player.hp <= 0
      if (lost) logs.push("失败：需要更多防御、冻结或爆发构筑。")

      let next = {
        ...s,
        turn: s.turn + 1,
        energy: s.maxEnergy,
        player: { ...player, block: 0 },
        enemy: { ...enemy, intent: chooseEnemyIntent(s.encounterIndex, s.turn + 1) },
        hand: [],
        discard: [...s.discard, ...s.hand],
        lost,
        log: [...s.log, ...logs].slice(-22),
      }

      next = drawCards(next, 5)
      next.log = [...next.log, `第 ${next.turn} 回合开始，抽 5 张牌。`].slice(-22)
      const triggered = triggerRelics(next, { type: "onTurnStart", enemyAura: next.enemy.aura })
      next = { ...triggered.state, log: [...triggered.state.log, ...triggered.logs].slice(-22) }
      return next
    })

    setSelected(null)
  }

  const chooseReward = (card) => {
    if (state.phase !== "reward") return

    setState((s) => {
      const added = makeInstance(card)
      const mapChoices = generateMapChoices(s.encounterIndex)

      return {
        ...s,
        phase: "map",
        gold: s.gold + s.rewardGold,
        masterDeck: [...s.masterDeck, added],
        relics: s.rewardRelic ? [...s.relics, s.rewardRelic] : s.relics,
        rewards: [],
        rewardRelic: null,
        rewardGold: 0,
        mapChoices,
        log: [...s.log, `选择奖励：「${card.name}」。卡组 +1。`, s.rewardRelic ? `获得遗物：${s.rewardRelic.name}。` : "", "进入路线选择。"].filter(Boolean).slice(-22),
      }
    })
  }

  const skipReward = () => {
    if (state.phase !== "reward") return

    setState((s) => ({
      ...s,
      phase: "map",
      gold: s.gold + s.rewardGold,
      relics: s.rewardRelic ? [...s.relics, s.rewardRelic] : s.relics,
      rewards: [],
      rewardRelic: null,
      rewardGold: 0,
      mapChoices: generateMapChoices(s.encounterIndex),
      log: [...s.log, "跳过卡牌奖励。", s.rewardRelic ? `获得遗物：${s.rewardRelic.name}。` : "", "进入路线选择。"].filter(Boolean).slice(-22),
    }))
  }

  const chooseMap = (choice) => {
    if (state.phase !== "map") return

    setState((s) => {
      const nextIndex = Math.min(choice.nextIndex, ENCOUNTERS.length - 1)
      const logs = [`选择路线：${choice.label}。`]

      if (choice.type === "rest") {
        return {
          ...s,
          phase: "rest",
          pendingNextIndex: nextIndex,
          mapChoices: [],
          log: [...s.log, ...logs, "抵达休息点。"].slice(-22),
        }
      }

      if (choice.type === "event") {
        return {
          ...s,
          phase: "event",
          currentEvent: shuffle(EVENT_POOL)[0],
          pendingNextIndex: nextIndex,
          mapChoices: [],
          log: [...s.log, ...logs, "遭遇事件。"].slice(-22),
        }
      }

      if (choice.type === "shop") {
        return {
          ...s,
          phase: "shop",
          shopInventory: generateShopInventory(),
          pendingNextIndex: nextIndex,
          mapChoices: [],
          log: [...s.log, ...logs, "进入商店。"].slice(-22),
        }
      }

      if (choice.type === "chest") {
        return {
          ...s,
          phase: "chest",
          chestReward: generateChestReward(),
          pendingNextIndex: nextIndex,
          mapChoices: [],
          log: [...s.log, ...logs, "发现宝箱。"].slice(-22),
        }
      }

      logs.push(`进入 ${ENCOUNTERS[nextIndex].floorLabel}：${ENCOUNTERS[nextIndex].name}。`)
      return enterCombat(s, nextIndex, logs)
    })

    setSelected(null)
  }

  const reset = () => {
    setState(createRun(state.character?.id))
    setSelected(null)
  }

  const enterCombat = (s, nextIndex, logs, healed = 0) => {
    const deck = shuffle(s.masterDeck.map(makeInstance))
    const nextCombat = {
      ...s,
      phase: "combat",
      encounterIndex: nextIndex,
      turn: 1,
      energy: s.maxEnergy,
      player: { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + healed), block: 0 },
      enemy: buildEnemy(nextIndex),
      drawPile: deck.slice(5),
      hand: deck.slice(0, 5),
      discard: [],
      exhausted: [],
      mapChoices: [],
      currentEvent: null,
      pendingNextIndex: null,
      shopInventory: null,
      chestReward: null,
      won: false,
      log: [...s.log, ...logs].slice(-22),
    }

    const passive = triggerCharacterPassive(nextCombat, { type: "onCombatStart" })
    const triggered = triggerRelics(passive.state, { type: "onCombatStart" })
    return { ...triggered.state, log: [...triggered.state.log, ...passive.logs, ...triggered.logs].slice(-22) }
  }

  const startCharacterRun = (characterId) => {
    setState(createRun(characterId))
    setSelected(null)
    setShowCharacters(false)
  }

  const continueToCombat = () => {
    setState((s) => {
      const nextIndex = s.pendingNextIndex ?? Math.min(s.encounterIndex + 1, ENCOUNTERS.length - 1)
      return enterCombat(s, nextIndex, [`进入 ${ENCOUNTERS[nextIndex].floorLabel}：${ENCOUNTERS[nextIndex].name}。`])
    })
  }

  const restAndContinue = () => {
    if (state.phase !== "rest") return
    setState((s) => {
      const healed = Math.min(18, s.player.maxHp - s.player.hp)
      const nextIndex = s.pendingNextIndex ?? Math.min(s.encounterIndex + 1, ENCOUNTERS.length - 1)
      return enterCombat(s, nextIndex, [`休息恢复 ${healed} 点生命。`, `进入 ${ENCOUNTERS[nextIndex].floorLabel}：${ENCOUNTERS[nextIndex].name}。`], healed)
    })
  }

  const canPay = (s, cost = {}) => {
    if ((cost.gold ?? 0) > s.gold) return false
    if ((cost.hp ?? 0) >= s.player.hp) return false
    if ((cost.maxHp ?? 0) >= s.player.maxHp) return false
    return true
  }

  const chooseEventOption = (choice) => {
    if (state.phase !== "event" || !canPay(state, choice.cost)) return

    setState((s) => {
      let player = { ...s.player }
      let gold = s.gold - (choice.cost?.gold ?? 0)
      const masterDeck = [...s.masterDeck]
      const relics = [...s.relics]
      const logs = [`事件选择：${choice.text}。`]

      if (choice.cost?.hp) player.hp = Math.max(1, player.hp - choice.cost.hp)
      if (choice.cost?.maxHp) {
        player.maxHp = Math.max(1, player.maxHp - choice.cost.maxHp)
        player.hp = Math.min(player.hp, player.maxHp)
      }
      if (choice.reward?.gold) gold += choice.reward.gold
      if (choice.reward?.heal) player.hp = Math.min(player.maxHp, player.hp + choice.reward.heal)
      if (choice.reward?.card) {
        const card = randomRewardCard()
        masterDeck.push(card)
        logs.push(`获得卡牌：${card.name}。`)
      }
      if (choice.reward?.relic) {
        const relic = randomRewardRelic()
        relics.push(relic)
        logs.push(`获得遗物：${relic.name}。`)
      }

      const nextIndex = s.pendingNextIndex ?? Math.min(s.encounterIndex + 1, ENCOUNTERS.length - 1)
      return enterCombat({ ...s, player, gold, masterDeck, relics }, nextIndex, [...logs, `进入 ${ENCOUNTERS[nextIndex].floorLabel}：${ENCOUNTERS[nextIndex].name}。`])
    })
  }

  const buyShopCard = (card) => {
    if (state.phase !== "shop" || state.gold < card.price) return
    setState((s) => ({
      ...s,
      gold: s.gold - card.price,
      masterDeck: [...s.masterDeck, makeInstance(card)],
      shopInventory: { ...s.shopInventory, cards: s.shopInventory.cards.filter((item) => item.uid !== card.uid) },
      log: [...s.log, `购买卡牌：${card.name}。`].slice(-22),
    }))
  }

  const buyShopRelic = (relic) => {
    if (state.phase !== "shop" || state.gold < relic.price) return
    setState((s) => ({
      ...s,
      gold: s.gold - relic.price,
      relics: [...s.relics, relic],
      shopInventory: { ...s.shopInventory, relics: s.shopInventory.relics.filter((item) => item.uid !== relic.uid) },
      log: [...s.log, `购买遗物：${relic.name}。`].slice(-22),
    }))
  }

  const takeChest = () => {
    if (state.phase !== "chest" || !state.chestReward) return
    setState((s) => {
      const reward = s.chestReward
      const nextIndex = s.pendingNextIndex ?? Math.min(s.encounterIndex + 1, ENCOUNTERS.length - 1)
      return enterCombat(
        { ...s, gold: s.gold + reward.gold, relics: [...s.relics, reward.relic] },
        nextIndex,
        [`打开宝箱：获得 ${reward.gold} 金币与遗物 ${reward.relic.name}。`, `进入 ${ENCOUNTERS[nextIndex].floorLabel}：${ENCOUNTERS[nextIndex].name}。`],
      )
    })
  }

  const hint = useMemo(() => {
    if (state.phase === "reward") return "从 3 张卡里选 1 张加入卡组，或者跳过。这里开始验证构筑成长。"
    if (state.phase === "map") return "选择下一条路线：普通战斗更稳，休息能回血，精英路线更快但更危险。"
    if (state.phase === "event") return "事件通常用资源换成长：优先看金币、生命和最大生命是否足够支付。"
    if (state.phase === "shop") return "商店可以补关键牌或遗物；当前 Demo 不做删牌，先验证购买成长。"
    if (state.phase === "rest") return "休息点会恢复生命，然后继续进入下一场战斗。"
    if (state.phase === "chest") return "宝箱提供金币与遗物，是路线中的低风险成长节点。"
    if (state.phase === "complete") return "Demo 通关。下一步可以加入遗物、商店和事件节点。"
    if (!state.enemy.aura) return "先用火、水、冰、雷给敌人附着元素，再用另一种元素触发反应。"
    if (state.enemy.aura === "pyro") return "敌人有火：用水触发高倍率蒸发，或用冰触发融化。"
    if (state.enemy.aura === "hydro") return "敌人有水：用火蒸发，或用冰冻结。"
    if (state.enemy.aura === "cryo") return "敌人有冰：用火融化，或用水冻结。"
    if (state.enemy.aura === "electro") return "敌人有雷：用火超载，造成额外爆炸伤害。"
    return "尝试风牌扩散当前元素。"
  }, [state.phase, state.enemy.aura])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-5 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">元素尖塔 2：战斗验证 Demo</h1>
            <p className="text-sm text-slate-600">Vite 多文件版：战斗、奖励、地图、数据已拆分。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowCharacters((value) => !value)} variant="outline"><TinyIcon name={state.character.element} />{state.character.name}</Button>
            <Button onClick={() => setShowDeck((value) => !value)} variant="outline"><TinyIcon name="card" />卡组 {state.masterDeck.length}</Button>
            <Button onClick={() => setShowTests((value) => !value)} variant="outline"><TinyIcon name={allTestsPassed ? "check" : "fail"} />自检 {passedCount}/{tests.length}</Button>
            <Button onClick={reset} variant="outline"><TinyIcon name="reset" />重新开始</Button>
          </div>
        </header>

        {showCharacters && (
          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">角色选择</h2>
                <p className="text-sm text-slate-600">选择角色会开始一局新 run。</p>
              </div>
              <Badge className="border-slate-300 bg-white text-slate-700">当前：{state.character.name}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {CHARACTERS.map((character) => {
                const meta = ELEMENTS[character.element]
                return (
                  <button key={character.id} type="button" onClick={() => startCharacterRun(character.id)} className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${state.character.id === character.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-bold">{meta.icon} {character.name}</div>
                      <Badge className={state.character.id === character.id ? "border-white/30 bg-white/20 text-white" : meta.cls}>{meta.label}</Badge>
                    </div>
                    <div className="mt-2 text-sm opacity-80">生命 {character.maxHp} · 费用 {character.maxEnergy} · 初始卡组 {character.starterDeck.length}</div>
                    <p className="mt-3 text-sm leading-relaxed opacity-80">{character.passive.description}</p>
                  </button>
                )
              })}
            </div>
          </Panel>
        )}

        <MiniMap
          phase={state.phase}
          encounterIndex={state.encounterIndex}
          mapChoices={state.mapChoices}
          runComplete={state.runComplete}
        />

        {showTests && (
          <Panel className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">轻量自检</h2>
              <Badge className={allTestsPassed ? "border-emerald-600 bg-emerald-600 text-white" : "border-red-600 bg-red-600 text-white"}>{allTestsPassed ? "全部通过" : "存在失败"}</Badge>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {tests.map((test) => (
                <div key={test.name} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <span className="mr-2">{test.passed ? ICONS.check : ICONS.fail}</span>
                  <span className="font-medium">{test.name}</span>
                  {test.detail && <span className="ml-2 text-slate-500">{test.detail}</span>}
                </div>
              ))}
            </div>
          </Panel>
        )}

        {showDeck && (
          <Panel className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">当前卡组</h2>
              <Badge className="border-slate-300 bg-white text-slate-700">{state.masterDeck.length} 张</Badge>
            </div>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
              {state.masterDeck.map((card, index) => {
                const meta = ELEMENTS[card.element] || ELEMENTS.physical
                return <div key={`${card.uid}_${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"><div className="font-bold">{meta.icon} {card.name}</div><div className="text-xs text-slate-500">{card.cost} 费 · {card.type}</div></div>
              })}
            </div>
          </Panel>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
          <main className="space-y-5">
            <Panel className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <StatPill icon="map" label="进度" value={currentEncounter.floorLabel} />
                  <StatPill icon="gold" label="金币" value={state.gold} />
                  <StatPill icon="energy" label="遗物" value={state.relics.length} />
                  <StatPill icon="heart" label="生命" value={`${state.player.hp}/${state.player.maxHp}`} />
                  <StatPill icon="shield" label="护盾" value={state.player.block} />
                  <StatPill icon="energy" label="费用" value={`${state.energy}/${state.maxEnergy}`} />
                  <StatPill icon="reset" label="回合" value={state.turn} />
                </div>
                <Button onClick={endTurn} disabled={state.phase !== "combat" || state.won || state.lost}>结束回合</Button>
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-slate-800 transition-all" style={{ width: `${playerHpPct}%` }} />
              </div>
            </Panel>

            {state.phase === "reward" && (
              <Panel className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">战斗奖励</h2>
                    <p className="text-sm text-slate-600">获得 {state.rewardGold} 金币和 1 件遗物。选择 1 张卡加入卡组，或跳过卡牌。</p>
                  </div>
                  <Button onClick={skipReward} variant="outline">跳过卡牌</Button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {state.rewards.map((card) => <CardView key={card.uid} card={card} onClick={() => chooseReward(card)} />)}
                </div>
                {state.rewardRelic && (
                  <div className="mt-4">
                    <div className="mb-2 text-sm font-bold text-slate-700">本次遗物</div>
                    <RelicView relic={state.rewardRelic} />
                  </div>
                )}
              </Panel>
            )}

            {state.phase === "map" && (
              <Panel className="p-5">
                <h2 className="text-xl font-bold">路线选择</h2>
                <p className="mt-1 text-sm text-slate-600">选择下一步。后续可以把这里扩展成完整爬塔地图。</p>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {state.mapChoices.map((choice) => (
                    <button key={choice.id} type="button" onClick={() => chooseMap(choice)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="text-3xl">{choice.icon}</div>
                      <div className="mt-3 text-lg font-bold">{choice.label}</div>
                      <div className="mt-1 text-sm text-slate-600">{choice.heal > 0 ? `恢复 ${choice.heal} 生命，然后进入下一战。` : `进入 ${ENCOUNTERS[choice.nextIndex].name}。`}</div>
                    </button>
                  ))}
                </div>
              </Panel>
            )}

            {state.phase === "event" && state.currentEvent && (
              <Panel className="p-5">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{state.currentEvent.icon}</div>
                  <div>
                    <h2 className="text-xl font-bold">{state.currentEvent.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{state.currentEvent.description}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {state.currentEvent.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={!canPay(state, choice.cost)}
                      onClick={() => chooseEventOption(choice)}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <div className="font-bold">{choice.text}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        {choice.cost?.gold ? `花费 ${choice.cost.gold} 金币` : choice.cost?.hp ? `失去 ${choice.cost.hp} 生命` : choice.cost?.maxHp ? `失去 ${choice.cost.maxHp} 最大生命` : "无代价"}
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>
            )}

            {state.phase === "shop" && state.shopInventory && (
              <Panel className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">商店</h2>
                    <p className="text-sm text-slate-600">购买卡牌或遗物，然后继续前进。</p>
                  </div>
                  <Button onClick={continueToCombat}>离开商店</Button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {state.shopInventory.cards.map((card) => (
                    <div key={card.uid} className="space-y-2">
                      <CardView card={card} disabled={state.gold < card.price} onClick={() => buyShopCard(card)} />
                      <Badge className="border-slate-300 bg-white text-slate-700">价格 {card.price} 金币</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {state.shopInventory.relics.map((relic) => (
                    <button key={relic.uid} type="button" disabled={state.gold < relic.price} onClick={() => buyShopRelic(relic)} className="text-left disabled:cursor-not-allowed disabled:opacity-45">
                      <RelicView relic={relic} />
                      <Badge className="mt-2 border-amber-300 bg-white text-amber-900">价格 {relic.price} 金币</Badge>
                    </button>
                  ))}
                </div>
              </Panel>
            )}

            {state.phase === "rest" && (
              <Panel className="p-8 text-center">
                <div className="text-5xl">{ICONS.rest}</div>
                <h2 className="mt-3 text-2xl font-bold">休息点</h2>
                <p className="mt-2 text-slate-600">恢复最多 18 点生命，然后继续前进。</p>
                <Button onClick={restAndContinue} className="mt-5">休息并前进</Button>
              </Panel>
            )}

            {state.phase === "chest" && state.chestReward && (
              <Panel className="p-8">
                <div className="text-center">
                  <div className="text-5xl">{ICONS.card}</div>
                  <h2 className="mt-3 text-2xl font-bold">宝箱</h2>
                  <p className="mt-2 text-slate-600">获得 {state.chestReward.gold} 金币与 1 件遗物。</p>
                </div>
                <div className="mx-auto mt-5 max-w-xl">
                  <RelicView relic={state.chestReward.relic} />
                  <Button onClick={takeChest} className="mt-4 w-full">领取并前进</Button>
                </div>
              </Panel>
            )}

            {state.phase === "complete" && (
              <Panel className="p-8 text-center">
                <div className="text-5xl">🏆</div>
                <h2 className="mt-3 text-2xl font-bold">Demo 路线通关</h2>
                <p className="mt-2 text-slate-600">你完成了连续战斗、卡牌奖励和路线选择闭环验证。</p>
                <Button onClick={reset} className="mt-5"><TinyIcon name="reset" />再来一局</Button>
              </Panel>
            )}

            {state.phase === "combat" && (
              <>
                <Panel className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold">{state.enemy.name}</h2>
                        <ElementBadge element={state.enemy.aura} />
                        {state.enemy.frozen > 0 && <Badge className="border-cyan-600 bg-cyan-600 text-white">冻结</Badge>}
                      </div>
                      <div className="h-4 w-72 max-w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-slate-800 transition-all" style={{ width: `${enemyHpPct}%` }} />
                      </div>
                      <div className="text-sm text-slate-600">HP {state.enemy.hp}/{state.enemy.maxHp} · 护盾 {state.enemy.block}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                      <div className="text-xs text-slate-500">敌人意图</div>
                      <div className="mt-1 flex items-center justify-center gap-2 text-lg font-bold"><TinyIcon name={state.enemy.intent.type === "block" ? "shield" : "swords"} />{describeIntent(state.enemy.intent)}</div>
                    </div>
                  </div>
                </Panel>

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">手牌</h2>
                    <div className="text-sm text-slate-500">抽牌堆 {state.drawPile.length} / 弃牌堆 {state.discard.length}</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {state.hand.map((card) => <CardView key={card.uid} card={card} selected={selected?.uid === card.uid} disabled={card.cost > state.energy || state.won || state.lost} onClick={() => setSelected(card)} />)}
                  </div>
                </section>
              </>
            )}
          </main>

          <aside className="space-y-5">
            <Panel className="space-y-3 p-5">
              <h2 className="font-bold">当前建议</h2>
              <p className="text-sm leading-relaxed text-slate-600">{hint}</p>
              {selected && state.phase === "combat" && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-bold">已选择：{selected.name}</div>
                  <p className="mt-1 text-sm text-slate-600">{selected.text}</p>
                  <Button className="mt-3 w-full" onClick={() => playCard(selected)} disabled={selected.cost > state.energy || state.won || state.lost}>打出这张牌</Button>
                </div>
              )}
              {state.lost && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">失败：说明防御、冻结和奖励成长需要继续平衡。</div>}
            </Panel>

            <Panel className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-bold">当前遗物</h2>
                <Badge className="border-amber-300 bg-amber-50 text-amber-800">{state.relics.length} 件</Badge>
              </div>
              <div className="space-y-2">
                {state.relics.map((relic) => <RelicView key={relic.uid} relic={relic} compact />)}
              </div>
            </Panel>

            <Panel className="p-5">
              <h2 className="font-bold">反应速查</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div>火 + 水：蒸发，高倍率伤害</div>
                <div>火 + 冰：融化，高倍率伤害</div>
                <div>火 + 雷：超载，额外爆炸伤害</div>
                <div>水 + 冰：冻结，敌人跳过行动</div>
                <div>风 + 已附着元素：扩散，额外伤害</div>
              </div>
            </Panel>

            <Panel className="p-5">
              <h2 className="font-bold">战斗日志</h2>
              <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1 text-sm">
                {state.log.map((line, i) => <div key={`${line}_${i}`} className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">{line}</div>)}
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  )
}
