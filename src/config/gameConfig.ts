/**
 * 게임 밸런스 설정 — 채굴 속도, 금고 용량, 업그레이드 비용, 부스터 효과,
 * 미션 보상, 출석 보너스를 전부 여기 한 파일에 모아둔다.
 * 여기 있는 수치는 전부 자리표시용 예시이며, 기획이 확정되면 이 파일만 수정하면 된다.
 * 광물은 데이터 기반(MINERALS 배열)이라 다이아 등 새 광물을 추가하기 쉽다.
 */

export type MineralId = 'coal' | 'silver' | 'gold' | 'diamond'

export interface MineralDef {
  id: MineralId
  name: string
  color: string
  unit: string
  /** true면 화면에는 보이되 아직 상호작용은 막는다(다이아 금고처럼). */
  locked: boolean
  unlockHint?: string
}

export const MINERALS: MineralDef[] = [
  { id: 'coal', name: '석탄', color: '#4E5968', unit: 'kg', locked: false },
  { id: 'silver', name: '은', color: '#B0B8C1', unit: 'g', locked: false },
  { id: 'gold', name: '금', color: '#FFC342', unit: 'g', locked: false },
  {
    id: 'diamond',
    name: '다이아',
    color: '#8FD3FF',
    unit: 'ct',
    locked: true,
    unlockHint: '금 금고 Lv.3이 되면 열려요',
  },
]

/** 앱을 꺼둔 동안에도 쌓이는 채굴량의 기본 상한(시간). */
export const MAX_OFFLINE_HOURS = 8

interface MinerStat {
  /**
   * index 0 = 레벨 1의 초당 채굴량. 배열 길이가 최대 레벨(예: 길이 5면 최대 Lv.5).
   * 기존 "시간당" 기획값을 절대량 그대로 유지한 채 /3600으로 환산한 값이라
   * (예: 2 → 2/3600), 8시간 누적량 : 금고 용량 비율은 변하지 않는다.
   */
  miningPerSecond: number[]
  /** index 0 = 레벨 1→2 업그레이드 비용(해당 광물 소모). 길이는 miningPerSecond보다 1 작다. */
  upgradeCost: number[]
}

interface VaultStat {
  /** index 0 = 레벨 1 용량. 배열 길이가 최대 레벨. */
  capacity: number[]
  /** index 0 = 레벨 1→2 업그레이드 비용(해당 광물 소모). 길이는 capacity보다 1 작다. */
  upgradeCost: number[]
}

/** 채굴기(채굴 속도) — 레벨별 초당 채굴량과 레벨업 비용. */
export const MINER: Record<MineralId, MinerStat> = {
  coal: { miningPerSecond: [2 / 3600, 3 / 3600, 4.5 / 3600, 6.5 / 3600, 9 / 3600], upgradeCost: [10, 20, 40, 80] },
  silver: { miningPerSecond: [0.5 / 3600, 0.8 / 3600, 1.2 / 3600, 1.8 / 3600, 2.6 / 3600], upgradeCost: [5, 10, 20, 40] },
  gold: { miningPerSecond: [0.4 / 3600, 0.8 / 3600, 1.3 / 3600, 2 / 3600, 3 / 3600], upgradeCost: [3, 6, 12, 24] },
  diamond: { miningPerSecond: [0.05 / 3600, 0.08 / 3600, 0.12 / 3600, 0.18 / 3600, 0.26 / 3600], upgradeCost: [1, 2, 4, 8] },
}

/** 금고 — 레벨별 용량과 레벨업 비용. */
export const VAULT: Record<MineralId, VaultStat> = {
  coal: { capacity: [60, 90, 120, 160, 210], upgradeCost: [15, 30, 60, 120] },
  silver: { capacity: [15, 25, 40, 60, 85], upgradeCost: [8, 16, 32, 64] },
  gold: { capacity: [10, 15, 20, 27, 35], upgradeCost: [4, 8, 16, 32] },
  diamond: { capacity: [2, 3, 4, 5, 6], upgradeCost: [1, 2, 4, 8] },
}

export type BoosterType = 'miningSpeedX2' | 'extraAccrualTime' | 'nextCollectX2'

export interface BoosterDef {
  type: BoosterType
  name: string
  description: string
  /** null이면 시간제가 아니라 다음 1회 행동에 적용되는 1회성 효과. */
  durationMs: number | null
}

export const BOOSTERS: BoosterDef[] = [
  {
    type: 'miningSpeedX2',
    name: '채굴 2배 30분',
    description: '광고를 보면 30분 동안 채굴이 두 배예요',
    durationMs: 30 * 60 * 1000,
  },
  {
    type: 'extraAccrualTime',
    name: '쌓이는 시간 늘리기',
    description: '다음 한 번, 쌓이는 시간이 2시간 늘어나요',
    durationMs: null,
  },
  {
    type: 'nextCollectX2',
    name: '다음 담기 2배',
    description: '금고에 담을 때 한 번 두 배로 담겨요',
    durationMs: null,
  },
]

/** '쌓이는 시간 늘리기' 부스터가 주는 유예 시간. */
export const EXTRA_ACCRUAL_BOOSTER_MS = 2 * 60 * 60 * 1000

export interface MissionDef {
  id: string
  title: string
  target: number
  rewardMineral: MineralId
  rewardAmount: number
  trigger: 'collect' | 'useBooster' | 'vaultUpgrade'
}

export const DAILY_MISSIONS: MissionDef[] = [
  { id: 'collect3', title: '금고에 3번 담기', target: 3, rewardMineral: 'gold', rewardAmount: 1, trigger: 'collect' },
  { id: 'useBooster1', title: '부스터 1번 쓰기', target: 1, rewardMineral: 'silver', rewardAmount: 3, trigger: 'useBooster' },
  { id: 'upgradeVault1', title: '금고 업그레이드 1번', target: 1, rewardMineral: 'gold', rewardAmount: 1, trigger: 'vaultUpgrade' },
]

export interface AttendanceDayReward {
  day: number // 1~7
  rewardMineral: MineralId
  rewardAmount: number
}

export const ATTENDANCE_REWARDS: AttendanceDayReward[] = [
  { day: 1, rewardMineral: 'coal', rewardAmount: 5 },
  { day: 2, rewardMineral: 'coal', rewardAmount: 8 },
  { day: 3, rewardMineral: 'silver', rewardAmount: 2 },
  { day: 4, rewardMineral: 'silver', rewardAmount: 3 },
  { day: 5, rewardMineral: 'gold', rewardAmount: 0.5 },
  { day: 6, rewardMineral: 'gold', rewardAmount: 0.8 },
  { day: 7, rewardMineral: 'gold', rewardAmount: 2 },
]
