import { Transaction } from '../models/Transaction'

export interface IgnoreAndBlockFilterServiceInterface {
  filterBlocked (transactions: Transaction[]): Promise<Transaction[]>
  filterIgnored (transactions: Transaction[]): Promise<Transaction[]>
}
