import { colors } from '../theme'

export type TabId = 'main' | 'vault' | 'booster' | 'attendance'

const TAB_ITEMS: { id: TabId; label: string }[] = [
  { id: 'main', label: '금광' },
  { id: 'vault', label: '금고' },
  { id: 'booster', label: '부스터' },
  { id: 'attendance', label: '출석' },
]

export function BottomTabBar({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  return (
    <nav
      aria-label="하단 메뉴"
      style={{
        flexShrink: 0,
        display: 'flex',
        background: colors.card,
        borderTop: `1px solid ${colors.divider}`,
        padding: '8px 8px 20px',
      }}
    >
      {TAB_ITEMS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              minHeight: 56,
              background: 'transparent',
              border: 0,
              color: isActive ? colors.textPrimary : colors.textSecondary,
              fontSize: 12,
              fontWeight: isActive ? 700 : 500,
              fontFamily: 'inherit',
            }}
          >
            <TabIcon tab={tab.id} active={isActive} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function TabIcon({ tab, active }: { tab: TabId; active: boolean }) {
  const strokeWidth = active ? 2.2 : 1.8
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (tab) {
    case 'main':
      return (
        <svg {...common}>
          <path d="M4 14l4-8 4 5 4-6 4 9" />
          <path d="M3 14h18v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
        </svg>
      )
    case 'vault':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      )
    case 'booster':
      return (
        <svg {...common}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </svg>
      )
    case 'attendance':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M3 10h18M9 15l2 2 4-4" />
        </svg>
      )
  }
}
