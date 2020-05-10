import { PreferencesIgnoreAndBlock } from '../models/PreferencesIgnoreAndBlock'

export interface PreferencesStorageServiceInterface {
  getPreferencesIgnoreAndBlock (): Promise<PreferencesIgnoreAndBlock>
  storePreferencesIgnoreAndBlock (preferences: PreferencesIgnoreAndBlock): Promise<void>
}
