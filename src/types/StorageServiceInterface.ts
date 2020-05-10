import { Transaction } from '../models/Transaction'
import { Signature } from '../models/Signature'

export interface StorageServiceInterface {
  storeTransactions (transactions: Transaction[]): Promise<Transaction[]>
  storeTransactionSignatures (transaction: Transaction, signatures: Signature[]): Promise<void>
  getTransactions (): Promise<Transaction[]>
  replaceAllTransactions (transactions: Transaction[]): Promise<void>
}
