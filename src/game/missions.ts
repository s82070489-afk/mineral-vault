import { DAILY_MISSIONS, type MissionDef } from '../config/gameConfig'
import { isSameLocalDay } from './date'
import type { GameState, MissionProgressState } from './types'

export function createFreshMissions(): MissionProgressState[] {
  return DAILY_MISSIONS.map((d) => ({ id: d.id, progress: 0, claimed: false }))
}

/** 자정이 지났으면 오늘 미션 진행도를 초기화한다(앱 진입 시 매번 호출). */
export function resetDailyMissionsIfNeeded(state: GameState, now: number): GameState {
  if (isSameLocalDay(state.missionsResetAt, now)) return state
  return { ...state, missions: createFreshMissions(), missionsResetAt: now }
}

/** 미션 조건에 맞는 행동이 일어났을 때 진행도를 올린다(예: 금고에 담기 성공 시 trigger: 'collect'). */
export function progressMissions(
  missions: MissionProgressState[],
  trigger: MissionDef['trigger'],
  amount = 1,
): MissionProgressState[] {
  return missions.map((m) => {
    const def = DAILY_MISSIONS.find((d) => d.id === m.id)
    if (!def || def.trigger !== trigger || m.claimed) return m
    return { ...m, progress: Math.min(def.target, m.progress + amount) }
  })
}

export function canClaimMission(mission: MissionProgressState): boolean {
  const def = DAILY_MISSIONS.find((d) => d.id === mission.id)
  return !!def && !mission.claimed && mission.progress >= def.target
}

export function claimMission(state: GameState, missionId: string): GameState {
  const mission = state.missions.find((m) => m.id === missionId)
  const def = DAILY_MISSIONS.find((d) => d.id === missionId)
  if (!mission || !def || !canClaimMission(mission)) return state

  const rewardMineral = state.minerals[def.rewardMineral]

  return {
    ...state,
    missions: state.missions.map((m) => (m.id === missionId ? { ...m, claimed: true } : m)),
    minerals: {
      ...state.minerals,
      [def.rewardMineral]: { ...rewardMineral, vaulted: rewardMineral.vaulted + def.rewardAmount },
    },
  }
}
