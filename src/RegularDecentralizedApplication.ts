import { TransactionTypeResolver } from './services/TransactionTypeResolver'
import { CryptoService } from './services/CryptoService'
import { TransactionSerializer } from './services/TransactionSerializer'
import { StorageService } from './services/StorageService'
import { TransportService } from './services/TransportService'
import { ValidatorService } from './services/ValidatorService'
import { IgnoreAndBlockFilterService } from './services/IgnoreAndBlockFilterService'
import { TransactionService } from './services/TransactionService'
import { UserService } from './services/UserService'
import { IgnoreAndBlockControlService } from './services/IgnoreAndBlockControlService'
import { ConnectionsPoolInterface } from './types/ConnectionsPoolInterface'
import {Transaction} from "./models/Transaction";

// noinspection JSUnusedGlobalSymbols
export class RegularDecentralizedApplication {
    public readonly namespace: string
    public readonly connectionsPool: ConnectionsPoolInterface
    public readonly maxSignaturesNumber: number

    public readonly transactionTypeResolver: TransactionTypeResolver
    public readonly cryptoService: CryptoService
    public readonly transactionSerializer: TransactionSerializer
    public readonly storageService: StorageService
    public readonly transportService: TransportService
    public readonly validatorService: ValidatorService
    public readonly ignoreAndBlockFilterService: IgnoreAndBlockFilterService
    public readonly ignoreAndBlockControlService: IgnoreAndBlockControlService
    public readonly transactionService: TransactionService
    public readonly userService: UserService

    constructor (
        namespace: string,
        connectionsPool: ConnectionsPoolInterface,
        maxSignaturesNumber = 5
    ) {
        this.namespace = namespace
        this.connectionsPool = connectionsPool
        this.maxSignaturesNumber = maxSignaturesNumber

        this.transactionTypeResolver = new TransactionTypeResolver()
        this.cryptoService = new CryptoService(this.transactionTypeResolver)
        this.transactionSerializer = new TransactionSerializer(this.transactionTypeResolver)
        this.storageService = new StorageService(this.namespace, this.transactionSerializer)
        this.transportService = new TransportService(this.connectionsPool, this.transactionSerializer, this.namespace)
        this.validatorService = new ValidatorService(this.cryptoService, this.transactionTypeResolver)
        this.ignoreAndBlockFilterService = new IgnoreAndBlockFilterService(this.storageService)
        this.transactionService = new TransactionService(
            this.cryptoService,
            this.transportService,
            this.storageService,
            this.validatorService,
            this.ignoreAndBlockControlService,
            this.ignoreAndBlockFilterService,
            this.maxSignaturesNumber
        )

        this.ignoreAndBlockControlService = new IgnoreAndBlockControlService(this.storageService)
        this.userService = new UserService(this.cryptoService, this.transactionService)
    }

    // noinspection JSUnusedGlobalSymbols
    public startNetworking (
        onNewTransactionsCallback: (newTransactions: Transaction[], storedTransactions: Transaction[]) => void,
        broadcastInterval: number
    ): void {
        this.transactionService.addOnNewTransactionsCallback(onNewTransactionsCallback)

        const transactionService = this.transactionService
        window.setInterval(async () => {
            await transactionService.broadcastTransactions()
        }, broadcastInterval)
    }
}
