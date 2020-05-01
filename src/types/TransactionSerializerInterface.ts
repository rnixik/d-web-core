import { Transaction } from '../models/Transaction'

export interface TransactionSerializerInterface {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  dataToTransaction (data: any, local: boolean): Transaction
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  transactionToData (transaction: Transaction, local: boolean): any
}
