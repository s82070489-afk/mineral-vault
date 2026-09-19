import { useState } from 'react'
import { BottomTabBar, type TabId } from './components/BottomTabBar'
import { MainScreen } from './screens/MainScreen'
import { VaultScreen } from './screens/VaultScreen'
import { BoosterScreen } from './screens/BoosterScreen'
import { AttendanceScreen } from './screens/AttendanceScreen'
import { colors } from './theme'

const SCREENS: Record<TabId, () => JSX.Element> = {
  main: MainScreen,
  vault: VaultScreen,
  booster: BoosterScreen,
  attendance: AttendanceScreen,
}

function App() {
  const [tab, setTab] = useState<TabId>('main')
  const Screen = SCREENS[tab]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.background }}>
      <div style={{ flexGrow: 1 }}>
        <Screen />
      </div>
      <BottomTabBar active={tab} onChange={setTab} />
    </div>
  )
}

export default App
