import { Button, Text } from '@toss/tds-mobile'
import { ScreenContainer } from '../components/ScreenContainer'
import { Card } from '../components/Card'
import { ProgressBar } from '../components/ProgressBar'
import { useGameState } from '../state/GameStateContext'
import { MINERALS, type MineralId } from '../config/gameConfig'
import { getVaultCapacity } from '../game/mining'
import { canUpgradeVault, getVaultUpgradeCost } from '../game/upgrades'
import { formatMineralAmount } from '../format'
import { colors } from '../theme'

export function VaultScreen() {
  const { state, upgradeVault } = useGameState()

  if (!state) {
    return (
      <ScreenContainer title="금고">
        <Text typography="t7">불러오는 중…</Text>
      </ScreenContainer>
    )
  }

  const unlockedCount = MINERALS.filter((m) => !m.locked && state.minerals[m.id].vaulted > 0).length

  return (
    <ScreenContainer title="금고">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text typography="t7" color={colors.textSecondary}>
              보관 중인 광물
            </Text>
            <div style={{ marginTop: 2 }}>
              <Text typography="st2" fontWeight="bold">
                {unlockedCount}종
              </Text>
            </div>
          </div>
          <Text typography="st13" color={colors.textSecondary} textAlign="right">
            광물이 귀할수록 금고는 작아요
          </Text>
        </div>
      </Card>

      {MINERALS.filter((m) => !m.locked).map((mineralDef) => (
        <VaultCard key={mineralDef.id} mineralId={mineralDef.id} onUpgrade={() => upgradeVault(mineralDef.id)} />
      ))}

      {MINERALS.filter((m) => m.locked).map((mineralDef) => (
        <Card key={mineralDef.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: colors.tabTrack,
                flexShrink: 0,
              }}
            />
            <div>
              <Text typography="st5" fontWeight="bold" color={colors.textSecondary}>
                {mineralDef.name} 금고
              </Text>
              <div style={{ marginTop: 2 }}>
                <Text typography="st13" color={colors.textSecondary}>
                  {mineralDef.unlockHint}
                </Text>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </ScreenContainer>
  )
}

function VaultCard({ mineralId, onUpgrade }: { mineralId: MineralId; onUpgrade: () => void }) {
  const { state } = useGameState()
  const mineralDef = MINERALS.find((m) => m.id === mineralId)!
  const mineral = state!.minerals[mineralId]
  const capacity = getVaultCapacity(mineralId, mineral.vaultLevel)
  const ratio = capacity > 0 ? mineral.vaulted / capacity : 0
  const upgradeCost = getVaultUpgradeCost(mineralId, mineral.vaultLevel)
  const canUpgrade = canUpgradeVault(mineral, mineralId)

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: mineralDef.color,
            flexShrink: 0,
          }}
        />
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <Text typography="st5" fontWeight="bold">
            {mineralDef.name} 금고
          </Text>
          <div style={{ marginTop: 2 }}>
            <Text typography="st13" color={colors.textSecondary}>
              {upgradeCost != null
                ? `Lv.${mineral.vaultLevel} · 업그레이드 ${mineralDef.name} ${formatMineralAmount(upgradeCost, mineralDef.unit)}`
                : `Lv.${mineral.vaultLevel} · 최대 레벨`}
            </Text>
          </div>
        </div>
        <Button size="medium" variant="weak" disabled={!canUpgrade} onClick={onUpgrade}>
          업그레이드
        </Button>
      </div>
      <div style={{ marginTop: 16 }}>
        <ProgressBar ratio={ratio} color={mineralDef.color} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Text typography="st13" color={colors.textSecondary}>
            보유 {formatMineralAmount(mineral.vaulted, mineralDef.unit)}
          </Text>
          <Text typography="st13" color={colors.textSecondary}>
            용량 {formatMineralAmount(capacity, mineralDef.unit)}
          </Text>
        </div>
      </div>
    </Card>
  )
}
