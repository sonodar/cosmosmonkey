const DefaultTagKey = 'AutoStartStop'

// 環境変数
export const AWS_REGION = process.env.AWS_REGION || ''
export const TAG_KEY = process.env.AUTO_START_STOP_TAG_KEY || DefaultTagKey
export const DRY_RUN = !!process.env.DRY_RUN && process.env.DRY_RUN !== 'false'
