/**
 * 전면/보상형 광고 호출을 이 함수들로 감싼다. 화면 진입 시 preloadFullScreenAd로 미리
 * 불러두고, 유저가 버튼을 눌렀을 때만 showFullScreenAdForReward를 호출한다(강제 노출 금지).
 * 보상은 반드시 userEarnedReward 이벤트에서만 지급한다. 실제 광고 그룹 ID는 .env로
 * 분리되어 있어(placement별 VITE_AD_GROUP_*), 나중에 값만 바꾸면 된다.
 */
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework'

export type AdPlacement =
  | 'doubleCollect'
  | 'boosterMiningX2'
  | 'boosterExtraTime'
  | 'boosterNextCollectX2'

const AD_GROUP_IDS: Record<AdPlacement, string | undefined> = {
  doubleCollect: import.meta.env.VITE_AD_GROUP_DOUBLE_COLLECT,
  boosterMiningX2: import.meta.env.VITE_AD_GROUP_BOOSTER_MINING_X2,
  boosterExtraTime: import.meta.env.VITE_AD_GROUP_BOOSTER_EXTRA_TIME,
  boosterNextCollectX2: import.meta.env.VITE_AD_GROUP_BOOSTER_NEXT_COLLECT_X2,
}

/** 화면에 들어올 때 호출해서 미리 로드해둔다. 반환값은 구독 해제 함수(언마운트 시 호출). */
export function preloadFullScreenAd(placement: AdPlacement, onLoaded?: () => void): () => void {
  const adGroupId = AD_GROUP_IDS[placement]
  if (!adGroupId) {
    console.warn(`[ads] "${placement}" 광고 그룹 ID가 .env에 설정되어 있지 않아요.`)
    return () => {}
  }

  if (!loadFullScreenAd.isSupported()) return () => {}

  return loadFullScreenAd({
    options: { adGroupId },
    onEvent: (event) => {
      if (event.type === 'loaded') onLoaded?.()
    },
    onError: (error) => console.warn(`[ads] "${placement}" 로드 실패`, error),
  })
}

/** 유저가 버튼을 눌렀을 때만 호출한다. 보상은 userEarnedReward에서만 지급한다. */
export function showFullScreenAdForReward(
  placement: AdPlacement,
  onRewardEarned: () => void,
  onClosedWithoutReward?: () => void,
): void {
  const adGroupId = AD_GROUP_IDS[placement]
  if (!adGroupId) {
    console.warn(`[ads] "${placement}" 광고 그룹 ID가 .env에 설정되어 있지 않아요.`)
    return
  }

  if (!showFullScreenAd.isSupported()) return

  let rewarded = false
  showFullScreenAd({
    options: { adGroupId },
    onEvent: (event) => {
      if (event.type === 'userEarnedReward') {
        rewarded = true
        onRewardEarned()
      } else if (event.type === 'dismissed' && !rewarded) {
        onClosedWithoutReward?.()
      }
    },
    onError: (error) => console.warn(`[ads] "${placement}" 표시 실패`, error),
  })
}
