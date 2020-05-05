import { Transaction } from '../models/Transaction'
import { TransportServiceInterface } from '../types/TransportServiceInterface'
import { TransactionSerializerInterface } from '../types/TransactionSerializerInterface'
import { ConnectionsPoolInterface } from '../types/ConnectionsPoolInterface'

export class TransportService implements TransportServiceInterface {
  private connectionsPool: ConnectionsPoolInterface
  private transactionSerializer: TransactionSerializerInterface
  private readonly namespace: string
  private onIncomingTransactionsCallbacks: ((transactions: Transaction[]) => void)[] = []

  constructor (
      connectionsPool: ConnectionsPoolInterface,
      transactionSerializer: TransactionSerializerInterface,
      namespace: string
  ) {
    this.connectionsPool = connectionsPool
    this.transactionSerializer = transactionSerializer
    this.namespace = namespace

    this.connectionsPool.addOnMessageCallback((message: string, peerId: string) => {
      console.log('Incoming message', new Blob([message]).size, peerId)
      try {
        const data = JSON.parse(message)
        if (!data || !data.ns || !data.type) {
          throw new Error('Cannot parse message')
        }
        if (data.ns !== this.namespace) {
          throw new Error('Different namespace')
        }
        if (data.type === 'txs' && data.txsData && data.txsData.length) {
          const transactions = []
          for (const txData of data.txsData) {
            transactions.push(this.transactionSerializer.dataToTransaction(txData, false))
          }

          if (transactions.length) {
            for (const callback of this.onIncomingTransactionsCallbacks) {
              callback(transactions)
            }
          }
        }
      } catch (e) {
        console.log('Cannot parse message from ' + peerId + ': ' + e.toString())
      }
    })
  }

  public send (transactions: Transaction[]): void {
    const serializedTransactions = []
    for (const tx of transactions) {
      serializedTransactions.push(this.transactionSerializer.transactionToData(tx, false))
    }

    const message = JSON.stringify({
      ns: this.namespace,
      type: 'txs',
      txsData: serializedTransactions
    })
    this.connectionsPool.sendMessage(message)
  }

  public addOnIncomingTransactionsCallback (callback: (transactions: Transaction[]) => void): void {
    this.onIncomingTransactionsCallbacks.push(callback)
  }
}
