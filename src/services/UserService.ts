import { AuthenticatedUser } from '../models/AuthenticatedUser'
import { TransactionService } from './TransactionService'
import { User } from '../models/User'
import { UserTransactionType } from '../transactions/User/UserTransactionType'
import { CryptoServiceInterface } from '../types/CryptoServiceInterface'
import { UserServiceInterface } from '../types/UserServiceInterface'
import { UserWithTransactions } from '../models/UserWithTransactions'

export class UserService implements UserServiceInterface {
  private cryptoService: CryptoServiceInterface
  private transactionService: TransactionService

  constructor (
    cryptoService: CryptoServiceInterface,
    transitionService: TransactionService
  ) {
    this.cryptoService = cryptoService
    this.transactionService = transitionService
  }

  public async register (login: string, password: string): Promise<AuthenticatedUser> {
    const authenticatedUser = this.cryptoService.getUserByLoginAndPassword(login, password)
    const publicUser = authenticatedUser.getPublicUser()
    const transaction = await this.transactionService.createTransaction(publicUser, UserTransactionType.t, publicUser)
    await this.transactionService.signAndSend(authenticatedUser, transaction)

    return authenticatedUser
  }

  public async login (login: string, password: string): Promise<AuthenticatedUser> {
    const authenticatedUser = this.cryptoService.getUserByLoginAndPassword(login, password)

    const userWithPubKey = await this.getUserByPublicKey(authenticatedUser.getPublicUser().publicKey)
    if (!userWithPubKey) {
      throw new Error('User has not been registered')
    }

    return authenticatedUser
  }

  // noinspection JSUnusedGlobalSymbols
  public async getUsersWithTransactions (removeIgnored: boolean): Promise<UserWithTransactions[]> {
    const usersWithTransactions: UserWithTransactions[] = []
    const allTransactions = await this.transactionService.getTransactions(removeIgnored)
    const usersIndex: Map<string, UserWithTransactions> = new Map()
    for (const tx of allTransactions) {
      if (tx.type === UserTransactionType.t) {
        const user = tx.model as User
        usersIndex.set(user.publicKey, new UserWithTransactions(user, []))
      }
    }
    for (const tx of allTransactions) {
      const userWithTransactions = usersIndex.get(tx.creator.publicKey)
      if (userWithTransactions) {
        userWithTransactions.addTransaction(tx)
      }
    }

    usersIndex.forEach((userWithTransactions) => {
      usersWithTransactions.push(userWithTransactions)
    })

    return usersWithTransactions
  }

  private async getUserByPublicKey (publicKey: string): Promise<User | null> {
    const storedTransactions = await this.transactionService.getTransactions()

    for (const tx of storedTransactions) {
      if (tx.type !== UserTransactionType.t) {
        continue
      }
      const user = tx.model as User
      if (user.publicKey === publicKey) {
        return user
      }
    }

    return null
  }
}
