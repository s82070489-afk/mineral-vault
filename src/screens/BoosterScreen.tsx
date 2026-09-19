import { useEffect, useState } from 'react'
import { Button, Text } from '@toss/tds-mobile'
import { ScreenContainer } from '../components/ScreenContainer'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { useGameState } from '../state/GameStateContext'
import { BOOSTERS, type BoosterType } from '../config/gameConfig'
import { getActiveBoosterRemainingMs } from '../game/boosters'
import { formatRemainingKor } from '../format'
import { useNowTick } from '../hooks/useNowTick'
import { colors } from '../theme'
import { type AdPlacement, preloadFullScreenAd, showFullScreenAdForReward } from '../ads/fullScreenAd'

const AD_PLACEMENT_BY_BOOSTER: Record<BoosterType, AdPlacement> = {
  miningSpeedX2: 'boosterMiningX2',
  extraAccrualTime: 'boosterExtraTime',
  nextCollectX2: 'boosterNextCollectX2',
}

export function BoosterScreen() {
  const { state, grantBooster } = useGameState()
  const now = useNowTick(1000)

  if (!state) {
    return (
      <ScreenContainer title="부스터">
        <Text typography="t7">불러오는 중…</Text>
      </ScreenContainer>
    )
  }

  const activeMiningBoost = state.activeBoosters.find((b) => b.type === 'miningSpeedX2' && b.expiresAt > now)
  const miningBoostDef = BOOSTERS.find((b) => b.type === 'miningSpeedX2')!
  const remainingMs = activeMiningBoost ? getActiveBoosterRemainingMs(state, 'miningSpeedX2', now) : 0
  const remainingRatio = miningBoostDef.durationMs ? remainingMs / miningBoostDef.durationMs : 0

  return (
    <ScreenContainer title="부스터">
      {activeMiningBoost && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                display: 'inline-block',
                background: colors.primaryWeakBg,
                color: colors.primaryWeakText,
                fontSize: 13,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 12,
              }}
            >
              진행 중
            </span>
            <Text typography="st13" color={colors.textSecondary}>
              남은 시간 {formatRemainingKor(remainingMs)}
            </Text>
          </div>
          <div style={{ marginTop: 12 }}>
            <Text typography="st2" fontWeight="bold">
              {miningBoostDef.name}
            </Text>
          </div>
          <Text typography="st13" color={colors.textSecondary}>
            모든 광물이 두 배로 쌓이고 있어요
          </Text>
          <div style={{ marginTop: 16 }}>
            <ProgressBar ratio={remainingRatio} color={colors.primary} />
          </div>
        </Card>
      )}

      <Text typography="st4" fontWeight="bold" style={{ padding: '8px 4px 0' }}>
        받을 수 있는 부스터
      </Text>

      <Card style={{ padding: '8px 20px' }}>
        {BOOSTERS.map((booster) => (
          <BoosterRow key={booster.type} type={booster.type} name={booster.name} description={booster.description} onGranted={() => grantBooster(booster.type)} />
        ))}
      </Card>

      <Text typography="st13" color={colors.textSecondary} style={{ padding: '4px 4px 0' }}>
        광고는 직접 눌렀을 때만 보여드려요. 금고에 담을 때는 광고 없이도 담을 수 있어요.
      </Text>
    </ScreenContainer>
  )
}

function BoosterRow({
  type,
  name,
  description,
  onGranted,
}: {
  type: BoosterType
  name: string
  description: string
  onGranted: () => void
}) {
  const [adReady, setAdReady] = useState(false)
  const placement = AD_PLACEMENT_BY_BOOSTER[type]

  useEffect(() => {
    const unsubscribe = preloadFullScreenAd(placement, () => setAdReady(true))
    return unsubscribe
  }, [placement])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <Text typography="st6" fontWeight="semibold">
          {name}
        </Text>
        <div style={{ marginTop: 2 }}>
          <Text typography="st13" color={colors.textSecondary}>
            {description}
          </Text>
        </div>
      </div>
      <Button
        size="medium"
        variant="weak"
        disabled={!adReady}
        onClick={() => {
          setAdReady(false)
          const reload = () => preloadFullScreenAd(placement, () => setAdReady(true))
          showFullScreenAdForReward(
            placement,
            () => {
              onGranted()
              reload()
            },
            reload,
          )
        }}
      >
        광고 보기
      </Button>
    </div>
  )
}
