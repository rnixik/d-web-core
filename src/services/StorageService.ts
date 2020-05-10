import { Transaction } from '../models/Transaction'
import { Signature } from '../models/Signature'
import { StorageServiceInterface } from '../types/StorageServiceInterface'
import { TransactionSerializerInterface } from '../types/TransactionSerializerInterface'
import { PreferencesStorageServiceInterface } from '../types/PreferencesStorageServiceInterface'
import { PreferencesIgnoreAndBlock } from '../models/PreferencesIgnoreAndBlock'

export class StorageService implements StorageServiceInterface, PreferencesStorageServiceInterface {
  private static STORAGE_KEY_TRANSACTIONS = 'transactions'
  private static STORAGE_KEY_PREFERENCES = 'preferences'

  private readonly namespace: string
  private readonly transactionSerializer: TransactionSerializerInterface

  constructor (namespace: string, transactionSerializer: TransactionSerializerInterface) {
    this.namespace = namespace
    this.transactionSerializer = transactionSerializer
  }

  public async storeTransactions (transactions: Transaction[]): Promise<Transaction[]> {
    const storedTransactions = await this.getTransactions()
    const storedHashIndex = new Map()
    for (const tx of storedTransactions) {
      storedHashIndex.set(tx.hash, true)
    }

    const transactionsToStore = storedTransactions
    const newStored: Transaction[] = []

    for (const tx of transactions) {
      if (!storedHashIndex.has(tx.hash)) {
        tx.storedAt = new Date()
        transactionsToStore.push(tx)
        newStored.push(tx)
      }
    }

    await this.replaceAllTransactions(transactionsToStore)

    return newStored
  }

  public async storeTransactionSignatures (transaction: Transaction, signatures: Signature[]): Promise<void> {
    const transactions = await this.getTransactions()
    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].hash === transaction.hash) {
        transactions[i].signatures = signatures
      }
    }

    await this.replaceAllTransactions(transactions)
  }

  public async getTransactions (): Promise<Transaction[]> {
    const transactionsString = localStorage.getItem(this.namespace + ':' + StorageService.STORAGE_KEY_TRANSACTIONS)
    if (!transactionsString) {
      return []
    }

    const transactionsData = JSON.parse(transactionsString)
    if (!transactionsData) {
      return []
    }

    const transactions: Transaction[] = []
    for (const txData of transactionsData) {
      try {
        transactions.push(this.transactionSerializer.dataToTransaction(txData, true))
      } catch (e) {
        throw new Error('Restoring transaction error: ' + e.message)
      }
    }

    return transactions
  }

  public async getPreferencesIgnoreAndBlock (): Promise<PreferencesIgnoreAndBlock> {
    const str = localStorage.getItem(this.namespace + ':' + StorageService.STORAGE_KEY_PREFERENCES)
    if (!str) {
      return new PreferencesIgnoreAndBlock(
        [],
        [],
        true,
        false,
        [],
        [],
        true,
        false
      )
    }
    return JSON.parse(str) as PreferencesIgnoreAndBlock
  }

  public async storePreferencesIgnoreAndBlock (preferences: PreferencesIgnoreAndBlock): Promise<void> {
    localStorage.setItem(this.namespace + ':' + StorageService.STORAGE_KEY_PREFERENCES, JSON.stringify(preferences))
  }

  public async replaceAllTransactions (transactions: Transaction[]): Promise<void> {
    const serialized = []
    for (const tx of transactions) {
      serialized.push(this.transactionSerializer.transactionToData(tx, true))
    }

    localStorage.setItem(this.namespace + ':' + StorageService.STORAGE_KEY_TRANSACTIONS, JSON.stringify(serialized))
  }

  // noinspection JSUnusedGlobalSymbols
  public getUsedStorageSpace (): number {
    let transactionsSpace = 0
    const transactionsString = localStorage.getItem(this.namespace + ':' + StorageService.STORAGE_KEY_TRANSACTIONS)
    if (transactionsString) {
      transactionsSpace = new Blob([transactionsString]).size
    }

    let preferencesSpace = 0
    const preferencesString = localStorage.getItem(this.namespace + ':' + StorageService.STORAGE_KEY_PREFERENCES)
    if (preferencesString) {
      preferencesSpace = new Blob([preferencesString]).size
    }

    return transactionsSpace + preferencesSpace
  }
}
