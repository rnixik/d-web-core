import { User } from '../models/User'
import { PreferencesStorageServiceInterface } from '../types/PreferencesStorageServiceInterface'
import { IgnoreAndBlockControlServiceInterface } from '../types/IgnoreAndBlockControlServiceInterface'
import { PreferencesIgnoreAndBlock } from '../models/PreferencesIgnoreAndBlock'

export class IgnoreAndBlockControlService implements IgnoreAndBlockControlServiceInterface {
  private preferencesStorageService: PreferencesStorageServiceInterface

  constructor (preferencesStorageService: PreferencesStorageServiceInterface) {
    this.preferencesStorageService = preferencesStorageService
  }

  public async getPreferences (): Promise<PreferencesIgnoreAndBlock> {
    return await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
  }

  public async addUserToBlockWhiteList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockWhiteList.push(user)
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public async addUserToBlockBlackList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockBlackList.push(user)
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public async addUserToIgnoreWhiteList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreWhiteList.push(user)
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public async addUserToIgnoreBlackList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreBlackList.push(user)
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }

  public async removeUserFromBlockWhiteList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockWhiteList = preferences.blockWhiteList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public async removeUserFromBlockBlackList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.blockBlackList = preferences.blockBlackList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public async removeUserFromIgnoreWhiteList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreWhiteList = preferences.ignoreWhiteList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
  public async removeUserFromIgnoreBlackList (user: User): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.ignoreBlackList = preferences.ignoreBlackList.filter((iu) => {
      return iu.publicKey !== user.publicKey
    })
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }

  public async setBlockWhiteListEnabled (enabled: boolean): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isBlockWhiteListEnabled = enabled
    if (enabled) {
      preferences.isBlockBlackListEnabled = false
    }
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }

  public async setBlockBlackListEnabled (enabled: boolean): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isBlockBlackListEnabled = enabled
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }

  public async setIgnoreWhiteListEnabled (enabled: boolean): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isIgnoreWhiteListEnabled = enabled
    if (enabled) {
      preferences.isIgnoreBlackListEnabled = false
    }
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }

  public async setIgnoreBlackListEnabled (enabled: boolean): Promise<void> {
    const preferences = await this.preferencesStorageService.getPreferencesIgnoreAndBlock()
    preferences.isIgnoreBlackListEnabled = enabled
    await this.preferencesStorageService.storePreferencesIgnoreAndBlock(preferences)
  }
}
