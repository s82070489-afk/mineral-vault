import { Button, Text } from '@toss/tds-mobile'
import { ScreenContainer } from '../components/ScreenContainer'
import { Card } from '../components/Card'
import { useGameState } from '../state/GameStateContext'
import { DAILY_MISSIONS, MINERALS } from '../config/gameConfig'
import { hasCheckedInToday } from '../game/attendance'
import { canClaimMission } from '../game/missions'
import { getWeekDateKeys, toLocalDateKey } from '../game/date'
import { formatMineralAmount } from '../format'
import { useNowTick } from '../hooks/useNowTick'
import { colors } from '../theme'

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

export function AttendanceScreen() {
  const { state, checkIn, claimMission } = useGameState()
  // 자정을 넘기면 오늘 날짜/이번 주 그리드가 갱신되도록 1분 간격으로만 지금 시각을 구독한다.
  const now = useNowTick(60_000)

  if (!state) {
    return (
      <ScreenContainer title="출석">
        <Text typography="t7">불러오는 중…</Text>
      </ScreenContainer>
    )
  }

  const todayKey = toLocalDateKey(now)
  const weekKeys = getWeekDateKeys(now)
  const checkedInToday = hasCheckedInToday(state, now)

  return (
    <ScreenContainer title="출석">
      <Card>
        <Text typography="t7" color={colors.textSecondary}>
          이번 주
        </Text>
        <div style={{ marginTop: 2 }}>
          <Text typography="st2" fontWeight="bold">
            {state.attendance.streak}일 연속 출석 중이에요
          </Text>
        </div>
        <Text typography="st13" color={colors.textSecondary}>
          연속으로 출석할수록 채굴 보너스가 커져요
        </Text>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          {weekKeys.map((dateKey, i) => {
            const checked = state.attendance.checkInDates.includes(dateKey)
            const isToday = dateKey === todayKey
            return (
              <div key={dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: checked ? colors.primary : isToday ? colors.card : colors.trackBg,
                    border: isToday && !checked ? `2px solid ${colors.primary}` : undefined,
                    color: '#FFFFFF',
                  }}
                >
                  {checked && (
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12l4 4 10-10" />
                    </svg>
                  )}
                </div>
                <Text typography="st13" fontWeight={isToday ? 'bold' : 'medium'} color={isToday ? colors.textPrimary : colors.textSecondary}>
                  {WEEKDAY_LABELS[i]}
                </Text>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 20 }}>
          <Button display="full" size="xlarge" disabled={checkedInToday} onClick={() => checkIn()}>
            {checkedInToday ? '오늘 출석 완료' : '오늘 출석 체크'}
          </Button>
        </div>
      </Card>

      <Card style={{ padding: '8px 20px' }}>
        <Text typography="st4" fontWeight="bold" style={{ padding: '12px 0 4px' }}>
          오늘의 미션
        </Text>
        {DAILY_MISSIONS.map((mission) => {
          const progress = state.missions.find((m) => m.id === mission.id)
          const claimed = progress?.claimed ?? false
          const claimable = progress ? canClaimMission(progress) : false

          return (
            <div key={mission.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <Text typography="st6" fontWeight="semibold">
                  {mission.title}
                </Text>
                <div style={{ marginTop: 2 }}>
                  <Text typography="st13" color={colors.textSecondary}>
                    {progress?.progress ?? 0}/{mission.target} · 보상{' '}
                    {formatMineralAmount(mission.rewardAmount, MINERALS.find((m) => m.id === mission.rewardMineral)!.unit)}{' '}
                    {MINERALS.find((m) => m.id === mission.rewardMineral)!.name}
                  </Text>
                </div>
              </div>
              <Button
                size="medium"
                variant={claimable ? 'fill' : 'weak'}
                disabled={claimed || !claimable}
                onClick={() => claimMission(mission.id)}
              >
                {claimed ? '완료' : claimable ? '받기' : '진행 중'}
              </Button>
            </div>
          )
        })}
      </Card>
    </ScreenContainer>
  )
}
