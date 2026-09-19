import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { BoosterType, MineralId } from '../config/gameConfig'
import { accrueAllMinerals, collectToVault as collectToVaultLogic } from '../game/mining'
import { upgradeMiner as upgradeMinerLogic, upgradeVault as upgradeVaultLogic } from '../game/upgrades'
import { grantBooster as grantBoosterLogic } from '../game/boosters'
import { checkIn as checkInLogic } from '../game/attendance'
import { claimMission as claimMissionLogic, progressMissions, resetDailyMissionsIfNeeded } from '../game/missions'
import { loadGameState, saveGameState } from '../storage/gameStorage'
import type { GameState } from '../game/types'

interface GameStateContextValue {
  state: GameState | null
  loading: boolean
  collect: (mineralId: MineralId, options?: { adDoubled?: boolean }) => void
  upgradeMiner: (mineralId: MineralId) => void
  upgradeVault: (mineralId: MineralId) => void
  grantBooster: (type: BoosterType) => void
  checkIn: () => void
  claimMission: (missionId: string) => void
}

const GameStateContext = createContext<GameStateContextValue | null>(null)

/** now 기준으로 채굴량을 정산하고 자정이 지났으면 일일 미션을 리셋한, "확정된" 체크포인트 상태를 만든다. */
function settle(state: GameState, now: number): GameState {
  return resetDailyMissionsIfNeeded(accrueAllMinerals(state, now), now)
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadGameState(Date.now()).then((loaded) => {
      if (cancelled) return
      setState(settle(loaded, Date.now()))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 앱이 백그라운드에 있다가 돌아왔을 때도 타임스탬프 기준으로 재정산한다.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      setState((prev) => {
        if (!prev) return prev
        const next = settle(prev, Date.now())
        void saveGameState(next)
        return next
      })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const update = useCallback((updater: (prev: GameState, now: number) => GameState) => {
    setState((prev) => {
      if (!prev) return prev
      const now = Date.now()
      const next = updater(settle(prev, now), now)
      void saveGameState(next)
      return next
    })
  }, [])

  const collect = useCallback<GameStateContextValue['collect']>(
    (mineralId, options) => {
      update((prev) => {
        const collected = collectToVaultLogic(prev, mineralId, options)
        return { ...collected, missions: progressMissions(collected.missions, 'collect') }
      })
    },
    [update],
  )

  const upgradeMiner = useCallback<GameStateContextValue['upgradeMiner']>(
    (mineralId) => update((prev) => upgradeMinerLogic(prev, mineralId)),
    [update],
  )

  const upgradeVault = useCallback<GameStateContextValue['upgradeVault']>(
    (mineralId) => {
      update((prev) => {
        const before = prev.minerals[mineralId].vaultLevel
        const upgraded = upgradeVaultLogic(prev, mineralId)
        const didUpgrade = upgraded.minerals[mineralId].vaultLevel > before
        return didUpgrade ? { ...upgraded, missions: progressMissions(upgraded.missions, 'vaultUpgrade') } : upgraded
      })
    },
    [update],
  )

  const grantBooster = useCallback<GameStateContextValue['grantBooster']>(
    (type) => {
      update((prev, now) => {
        const boosted = grantBoosterLogic(prev, type, now)
        return { ...boosted, missions: progressMissions(boosted.missions, 'useBooster') }
      })
    },
    [update],
  )

  const checkIn = useCallback(() => {
    update((prev, now) => checkInLogic(prev, now))
  }, [update])

  const claimMission = useCallback<GameStateContextValue['claimMission']>(
    (missionId) => update((prev) => claimMissionLogic(prev, missionId)),
    [update],
  )

  return (
    <GameStateContext.Provider
      value={{ state, loading: state === null, collect, upgradeMiner, upgradeVault, grantBooster, checkIn, claimMission }}
    >
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameState(): GameStateContextValue {
  const ctx = useContext(GameStateContext)
  if (!ctx) throw new Error('useGameState는 GameStateProvider 안에서만 사용할 수 있어요.')
  return ctx
}
