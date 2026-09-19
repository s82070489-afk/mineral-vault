import { MAX_OFFLINE_HOURS, MINER, VAULT, type MineralId } from '../config/gameConfig'
import type { BoosterState, GameState, MineralState } from './types'

const MS_PER_HOUR = 60 * 60 * 1000
const MAX_OFFLINE_MS = MAX_OFFLINE_HOURS * MS_PER_HOUR

function statAtLevel(values: number[], level: number): number {
  return values[level - 1] ?? values[values.length - 1]
}

export function isBoosterActive(activeBoosters: BoosterState[], type: BoosterState['type'], now: number): boolean {
  return activeBoosters.some((b) => b.type === type && b.expiresAt > now)
}

export function pruneExpiredBoosters(activeBoosters: BoosterState[], now: number): BoosterState[] {
  return activeBoosters.filter((b) => b.expiresAt > now)
}

export function getMiningRatePerHour(
  mineralId: MineralId,
  minerLevel: number,
  activeBoosters: BoosterState[],
  now: number,
): number {
  const base = statAtLevel(MINER[mineralId].values, minerLevel)
  return isBoosterActive(activeBoosters, 'miningSpeedX2', now) ? base * 2 : base
}

export function getVaultCapacity(mineralId: MineralId, vaultLevel: number): number {
  return statAtLevel(VAULT[mineralId].values, vaultLevel)
}

/**
 * 광물 하나의 pending을 (now - lastAccrualAt) 만큼 정산한다.
 * 기본적으로 MAX_OFFLINE_HOURS만큼만 쌓이고, bonusAccrualMsCredit이 남아있으면
 * 그만큼 상한을 늘려서 이번 정산에 한 번 써버린다(크레딧은 전역 1회성이라 가장 먼저
 * 정산되는 광물에서 소모됨 — 여러 광물에 나눠 쓰지 않는다).
 */
export function accrueMineral(
  mineral: MineralState,
  mineralId: MineralId,
  now: number,
  activeBoosters: BoosterState[],
  bonusAccrualMsCredit: number,
): { mineral: MineralState; usedCredit: number } {
  const ratePerHour = getMiningRatePerHour(mineralId, mineral.minerLevel, activeBoosters, now)
  const elapsedMs = Math.max(0, now - mineral.lastAccrualAt)
  const cap = MAX_OFFLINE_MS + bonusAccrualMsCredit
  const cappedMs = Math.min(elapsedMs, cap)
  const usedCredit = Math.max(0, Math.min(bonusAccrualMsCredit, elapsedMs - MAX_OFFLINE_MS))
  const accrued = ratePerHour * (cappedMs / MS_PER_HOUR)

  return {
    mineral: { ...mineral, pending: mineral.pending + accrued, lastAccrualAt: now },
    usedCredit,
  }
}

/**
 * 실제 상태는 건드리지 않고, 지금 이 순간(now) 기준 pending이 얼마일지 미리 계산만 한다.
 * 화면의 "쌓이는" 실시간 카운터 연출에 쓰고, 저장되는 확정 값은 accrueAllMinerals가 담당한다.
 */
export function previewPending(
  mineral: MineralState,
  mineralId: MineralId,
  now: number,
  activeBoosters: BoosterState[],
  bonusAccrualMsCredit: number,
): number {
  return accrueMineral(mineral, mineralId, now, activeBoosters, bonusAccrualMsCredit).mineral.pending
}

/** 모든 광물의 pending을 한 번에 정산하고, 만료된 부스터를 정리한다. */
export function accrueAllMinerals(state: GameState, now: number): GameState {
  let remainingCredit = state.bonusAccrualMsCredit
  const minerals = { ...state.minerals }

  for (const id of Object.keys(minerals) as MineralId[]) {
    const result = accrueMineral(minerals[id], id, now, state.activeBoosters, remainingCredit)
    minerals[id] = result.mineral
    remainingCredit -= result.usedCredit
  }

  return {
    ...state,
    minerals,
    bonusAccrualMsCredit: remainingCredit,
    activeBoosters: pruneExpiredBoosters(state.activeBoosters, now),
  }
}

/**
 * 금고에 담기. 용량을 넘는 양은 담기지 않고 사라진다(스펙: "용량까지만 담겨요").
 * adDoubled가 true면 담기는 양이 2배(광고 시청 보상), nextCollectMultiplier가 남아있으면
 * 함께 곱해진 뒤 1회성으로 소모된다. 광고 없이도 항상 호출 가능하다.
 */
export function collectToVault(
  state: GameState,
  mineralId: MineralId,
  options: { adDoubled?: boolean } = {},
): GameState {
  const mineral = state.minerals[mineralId]
  const capacity = getVaultCapacity(mineralId, mineral.vaultLevel)
  const roomLeft = Math.max(0, capacity - mineral.vaulted)
  const multiplier = (options.adDoubled ? 2 : 1) * state.nextCollectMultiplier
  const deposit = Math.min(roomLeft, mineral.pending * multiplier)

  return {
    ...state,
    minerals: {
      ...state.minerals,
      [mineralId]: { ...mineral, vaulted: mineral.vaulted + deposit, pending: 0 },
    },
    nextCollectMultiplier: 1,
  }
}
