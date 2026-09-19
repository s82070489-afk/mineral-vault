/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AD_GROUP_DOUBLE_COLLECT?: string
  readonly VITE_AD_GROUP_BOOSTER_MINING_X2?: string
  readonly VITE_AD_GROUP_BOOSTER_EXTRA_TIME?: string
  readonly VITE_AD_GROUP_BOOSTER_NEXT_COLLECT_X2?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
