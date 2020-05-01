import { Transaction } from './Transaction'
import { User } from './User'

export class UserWithTransactions {
  public user: User;
  public transactions: Transaction[];

  constructor (user: User, transactions: Transaction[]) {
    this.user = user
    this.transactions = transactions
  }

  public addTransaction (transaction: Transaction): void {
    this.transactions.push(transaction)
  }
}
