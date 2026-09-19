import { useEffect, useState } from 'react'
import { Button, Text } from '@toss/tds-mobile'
import { ScreenContainer } from '../components/ScreenContainer'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { useGameState } from '../state/GameStateContext'
import { MINERALS, type MineralId } from '../config/gameConfig'
import { getMiningRatePerHour, getVaultCapacity, previewPending } from '../game/mining'
import { formatAmount, formatMineralAmount } from '../format'
import { useNowTick } from '../hooks/useNowTick'
import { colors } from '../theme'
import { preloadFullScreenAd, showFullScreenAdForReward } from '../ads/fullScreenAd'

const MINABLE_MINERALS = MINERALS.filter((m) => !m.locked)

export function MainScreen() {
  const { state, collect } = useGameState()
  const [selected, setSelected] = useState<MineralId>('gold')
  const [adReady, setAdReady] = useState(false)
  const now = useNowTick(1000)

  useEffect(() => {
    // '2배로 담기' 광고는 선택된 광물과 무관하게 같은 placement 하나라 마운트 시 한 번만 로드한다.
    const unsubscribe = preloadFullScreenAd('doubleCollect', () => setAdReady(true))
    return unsubscribe
  }, [])

  if (!state) {
    return (
      <ScreenContainer title="금광">
        <Text typography="t7">불러오는 중…</Text>
      </ScreenContainer>
    )
  }

  const mineralDef = MINERALS.find((m) => m.id === selected)!
  const mineral = state.minerals[selected]
  const displayPending = previewPending(mineral, selected, now, state.activeBoosters, state.bonusAccrualMsCredit)
  const ratePerHour = getMiningRatePerHour(selected, mineral.minerLevel, state.activeBoosters, now)
  const vaultCapacity = getVaultCapacity(selected, mineral.vaultLevel)
  const vaultRatio = vaultCapacity > 0 ? mineral.vaulted / vaultCapacity : 0

  return (
    <ScreenContainer title="금광">
      <div style={{ background: colors.tabTrack, borderRadius: 14, padding: 4, display: 'flex', gap: 2 }}>
        {MINABLE_MINERALS.map((m) => {
          const isActive = m.id === selected
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m.id)}
              style={{
                flex: 1,
                height: 44,
                border: 0,
                borderRadius: 10,
                fontFamily: 'inherit',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: isActive ? colors.card : 'transparent',
                color: isActive ? colors.textPrimary : colors.textSecondary,
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 1px 3px rgba(25,31,40,0.10)' : 'none',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
              {m.name}
            </button>
          )
        })}
      </div>

      <Card>
        <Text typography="t7" color={colors.textSecondary}>
          지금 금광에 쌓인 {mineralDef.name}
        </Text>
        <div style={{ marginTop: 4 }}>
          <Text typography="t1" fontWeight="bold">
            {formatMineralAmount(displayPending, mineralDef.unit)}
          </Text>
        </div>
        <Text typography="st5" fontWeight="semibold" color={colors.primaryWeakText}>
          시간당 +{formatMineralAmount(ratePerHour, mineralDef.unit)} 채굴 중
        </Text>

        <div style={{ marginTop: 16 }}>
          <ProgressBar ratio={vaultRatio} color={mineralDef.color} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Text typography="st13" color={colors.textSecondary}>
              금고 {Math.round(vaultRatio * 100)}%
            </Text>
            <Text typography="st13" color={colors.textSecondary}>
              용량 {formatMineralAmount(vaultCapacity, mineralDef.unit)}
            </Text>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button display="full" size="xlarge" onClick={() => collect(selected)} disabled={displayPending <= 0}>
            금고에 담기
          </Button>
        </div>
        <div style={{ marginTop: 10 }}>
          <Button
            display="full"
            size="large"
            variant="weak"
            disabled={!adReady || displayPending <= 0}
            onClick={() => {
              setAdReady(false)
              const reload = () => preloadFullScreenAd('doubleCollect', () => setAdReady(true))
              showFullScreenAdForReward(
                'doubleCollect',
                () => {
                  collect(selected, { adDoubled: true })
                  reload()
                },
                reload,
              )
            }}
          >
            광고 보고 2배로 담기
          </Button>
        </div>
      </Card>

      <Card style={{ padding: '4px 20px' }}>
        <InfoRow label="채굴 속도" value={`시간당 ${formatAmount(ratePerHour)}${mineralDef.unit}`} />
        <InfoRow label="채굴기 레벨" value={`Lv.${mineral.minerLevel}`} />
      </Card>
    </ScreenContainer>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text typography="t7" color={colors.textSecondary}>
        {label}
      </Text>
      <Text typography="st5" fontWeight="semibold">
        {value}
      </Text>
    </div>
  )
}
