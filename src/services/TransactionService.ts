import { Transaction } from '../models/Transaction'
import { User } from '../models/User'
import { AuthenticatedUser } from '../models/AuthenticatedUser'
import { Signature } from '../models/Signature'
import { TransactionModel } from '../types/TransactionModel'
import { CryptoServiceInterface } from '../types/CryptoServiceInterface'
import { StorageServiceInterface } from '../types/StorageServiceInterface'
import { TransportServiceInterface } from '../types/TransportServiceInterface'
import { ValidatorServiceInterface } from '../types/ValidatorServiceInterface'
import { IgnoreAndBlockFilterServiceInterface } from '../types/IgnoreAndBlockFilterServiceInterface'
import { IgnoreAndBlockControlServiceInterface } from '../types/IgnoreAndBlockControlServiceInterface'

export class TransactionService {
  private transport: TransportServiceInterface
  private storageService: StorageServiceInterface
  private validator: ValidatorServiceInterface
  private cryptoService: CryptoServiceInterface
  private ignoreAndBlockControlService: IgnoreAndBlockControlServiceInterface
  private ignoreAndBlockFilterService: IgnoreAndBlockFilterServiceInterface
  private onNewTransactionsCallbacks: ((newTransactions: Transaction[], storedTransactions: Transaction[]) => void)[] = []
  private readonly maxSignaturesNumber: number

  constructor (
    cryptoService: CryptoServiceInterface,
    transport: TransportServiceInterface,
    storageService: StorageServiceInterface,
    validator: ValidatorServiceInterface,
    ignoreAndBlockControlService: IgnoreAndBlockControlServiceInterface,
    ignoreAndBlockFilterService: IgnoreAndBlockFilterServiceInterface,
    maxSignaturesNumber = 0
  ) {
    this.transport = transport
    this.storageService = storageService
    this.validator = validator
    this.cryptoService = cryptoService
    this.ignoreAndBlockFilterService = ignoreAndBlockFilterService
    this.ignoreAndBlockControlService = ignoreAndBlockControlService
    this.maxSignaturesNumber = maxSignaturesNumber

    this.transport.addOnIncomingTransactionsCallback(async (transactions) => {
      await this.handleIncomingTransactions(transactions)
    })
  }

  public async createTransaction (creator: User, type: string, model: TransactionModel): Promise<Transaction> {
    const hash = this.cryptoService.calculateTransactionHash(creator, type, model)
    const transaction = new Transaction(creator, type, model, hash)
    await this.validator.validateSpecific(await this.getTransactions(), transaction)

    return transaction
  }

  public async getTransactions (removeIgnored = false): Promise<Transaction[]> {
    const allTransactions = await this.storageService.getTransactions()
    if (!removeIgnored) {
      return allTransactions
    }
    return await this.ignoreAndBlockFilterService.filterIgnored(allTransactions)
  }

  public async signAndSend (sender: AuthenticatedUser, transaction: Transaction): Promise<void> {
    const signedTx = this.cryptoService.signTransaction(sender, transaction)
    this.transport.send([signedTx])

    const newStoredTransactions = await this.storageService.storeTransactions([signedTx])
    if (newStoredTransactions.length) {
      await this.notifyContextAboutNewTransactions(
          newStoredTransactions,
          await this.storageService.getTransactions()
      )
    }
  }

  public addOnNewTransactionsCallback (callback: (newTransactions: Transaction[], storedTransactions: Transaction[]) => void): void {
    this.onNewTransactionsCallbacks.push(callback)
  }

  public async broadcastTransactions (): Promise<void> {
    const storedTransactions = await this.storageService.getTransactions()
    this.transport.send(storedTransactions)
  }

  // noinspection JSUnusedGlobalSymbols
  public async filterAndStoreStoredTransactions (): Promise<void> {
    const storedTransactions = await this.storageService.getTransactions()
    const filteredTransactions = await this.ignoreAndBlockFilterService.filterBlocked(storedTransactions)
    await this.storageService.replaceAllTransactions(filteredTransactions)
  }

  private async handleIncomingTransactions (incomingTransactions: Transaction[]): Promise<void> {
    const storedTransactions = await this.storageService.getTransactions()
    const transactionsToStore: Transaction[] = []
    const hashesToBlock: string[] = []

    incomingTransactions = await this.ignoreAndBlockFilterService.filterBlocked(incomingTransactions)

    for (const incomingTx of incomingTransactions) {
      let txWasStored = false
      for (const storedTx of storedTransactions) {
        if (incomingTx.hash === storedTx.hash) {
          await this.updateStoredTransactionFromIncoming(storedTx, incomingTx)
          txWasStored = true
          break
        }
      }
      if (!txWasStored) {
        try {
          this.validator.validateBase(storedTransactions, incomingTx)
        } catch (e) {
          hashesToBlock.push(incomingTx.hash)
          console.error('Incoming transaction is invalid by base rules', e, incomingTx)
          continue
        }

        try {
          await this.validator.validateSpecific(storedTransactions, incomingTx)
          transactionsToStore.push(incomingTx)
          storedTransactions.push(incomingTx)
        } catch (e) {
          hashesToBlock.push(incomingTx.hash)
          console.error('Incoming transaction is invalid by specific rules', e, incomingTx)
        }
      }
    }

    if (transactionsToStore.length) {
      const newStoredTransactions = await this.storageService.storeTransactions(transactionsToStore)
      if (newStoredTransactions.length) {
        await this.notifyContextAboutNewTransactions(newStoredTransactions, storedTransactions)
      }
    }

    if (hashesToBlock.length) {
      // Block invalid transactions. The list of blocked can be cleared manually later.
      await this.ignoreAndBlockControlService.addTransactionHashesToBlock(hashesToBlock)
    }
  }

  private async updateStoredTransactionFromIncoming (storedTx: Transaction, incomingTx: Transaction): Promise<void> {
    const signatures = storedTx.signatures.concat(incomingTx.signatures)
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const publicKeys: any = {}
    let uniqueSignatures: Signature[] = []
    for (const signature of signatures) {
      if (!publicKeys[signature.publicKey]) {
        publicKeys[signature.publicKey] = true
        uniqueSignatures.push(signature)
      }
    }
    if (this.maxSignaturesNumber > 0) {
      uniqueSignatures = uniqueSignatures.slice(0, this.maxSignaturesNumber)
    }
    if (uniqueSignatures.length > storedTx.signatures.length) {
      await this.storageService.storeTransactionSignatures(storedTx, uniqueSignatures)
    }
  }

  private async notifyContextAboutNewTransactions (newTransactions: Transaction[], storedTransactions: Transaction[]): Promise<void> {
    newTransactions = await this.ignoreAndBlockFilterService.filterIgnored(newTransactions)
    storedTransactions = await this.ignoreAndBlockFilterService.filterIgnored(storedTransactions)
    for (const callback of this.onNewTransactionsCallbacks) {
      callback(newTransactions, storedTransactions)
    }
  }
}
