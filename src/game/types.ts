import type { BoosterType, MineralId } from '../config/gameConfig'

export interface MineralState {
  /** 1부터 시작. */
  minerLevel: number
  vaultLevel: number
  /** 아직 금고에 담기지 않고 화면에 쌓이고 있는 양(오프라인 계산치). */
  pending: number
  /** 금고에 보관된 양. */
  vaulted: number
  /** pending을 마지막으로 정산한 시각(ms epoch). */
  lastAccrualAt: number
}

export interface BoosterState {
  type: BoosterType
  /** 시간제 부스터의 만료 시각(ms epoch). */
  expiresAt: number
}

export interface MissionProgressState {
  id: string
  progress: number
  claimed: boolean
}

export interface AttendanceState {
  /** 연속 출석일(1~7). 8일째부터는 7 유지, 정책은 추후 확정. */
  streak: number
  lastCheckInAt: number | null
  /** 출석한 날짜('YYYY-MM-DD', 로컬 기준) 목록 — 월~일 그리드를 실제 날짜에 맞춰 그리기 위함. */
  checkInDates: string[]
}

export interface GameState {
  version: number
  minerals: Record<MineralId, MineralState>
  /** 시간제 부스터(예: 채굴 2배). */
  activeBoosters: BoosterState[]
  /** '쌓이는 시간 늘리기' 부스터로 얻은 1회성 유예 시간 크레딧(ms). */
  bonusAccrualMsCredit: number
  /** '다음 담기 2배' 부스터의 1회성 배율. 기본 1. */
  nextCollectMultiplier: number
  missions: MissionProgressState[]
  /** 일일 미션이 마지막으로 리셋된 시각(자정 기준 비교용). */
  missionsResetAt: number
  attendance: AttendanceState
}
