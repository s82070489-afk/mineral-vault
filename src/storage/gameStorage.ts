/**
 * 저장소 접근을 이 파일 한 곳에 모아둔다. SDK Storage(@apps-in-toss/web-framework)를 쓰며,
 * 게임 상태 전체를 단일 키 하나에 JSON으로 직렬화해서 저장한다(필드별로 키를 쪼개지 않음).
 * SDK/스키마 버전이 바뀌면 STORAGE_KEY 뒤 버전을 올리고 여기서만 마이그레이션을 처리하면 된다.
 */
import { Storage } from '@apps-in-toss/web-framework'
import { createInitialState } from '../game/initialState'
import type { GameState } from '../game/types'

const STORAGE_KEY = 'mineralVault:gameState:v1'

export async function loadGameState(now: number): Promise<GameState> {
  try {
    const raw = await Storage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState(now)

    const parsed = JSON.parse(raw) as GameState
    if (parsed.version !== createInitialState(now).version) {
      // 스키마 버전이 다르면 일단 새 상태로 시작한다. 실제 마이그레이션이 필요해지면 여기서 변환한다.
      return createInitialState(now)
    }
    return parsed
  } catch {
    return createInitialState(now)
  }
}

export async function saveGameState(state: GameState): Promise<void> {
  await Storage.setItem(STORAGE_KEY, JSON.stringify(state))
}
