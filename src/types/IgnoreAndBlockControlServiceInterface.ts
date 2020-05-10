import { User } from '../models/User'
import { PreferencesIgnoreAndBlock } from '../models/PreferencesIgnoreAndBlock'

export interface IgnoreAndBlockControlServiceInterface {
  getPreferences (): Promise<PreferencesIgnoreAndBlock>
  addUserToBlockWhiteList (user: User): Promise<void>
  addUserToBlockBlackList (user: User): Promise<void>
  addUserToIgnoreWhiteList (user: User): Promise<void>
  addUserToIgnoreBlackList (user: User): Promise<void>
  removeUserFromBlockWhiteList (user: User): Promise<void>
  removeUserFromBlockBlackList (user: User): Promise<void>
  removeUserFromIgnoreWhiteList (user: User): Promise<void>
  removeUserFromIgnoreBlackList (user: User): Promise<void>
  setBlockWhiteListEnabled (enabled: boolean): Promise<void>
  setBlockBlackListEnabled (enabled: boolean): Promise<void>
  setIgnoreWhiteListEnabled (enabled: boolean): Promise<void>
  setIgnoreBlackListEnabled (enabled: boolean): Promise<void>
}
