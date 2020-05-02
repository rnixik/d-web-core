import { TransactionSerializer } from '../../src/services/TransactionSerializer'
import { TransactionTypeResolver } from '../../src/services/TransactionTypeResolver'
import { User } from '../../src/models/User'
import { UserTransactionType } from '../../src/transactions/User/UserTransactionType'
import { Transaction } from '../../src/models/Transaction'
import { Signature } from '../../src/models/Signature'

const typeResolver = new TransactionTypeResolver()
const txSerializer = new TransactionSerializer(typeResolver)

describe('Transaction serializer', () => {
    test('Data to transaction - local', () => {
        const creator = new User('login', 'pub-key')
        const expectedTransaction = new Transaction(
            creator,
            UserTransactionType.t,
            creator,
            'hash'
        )
        expectedTransaction.storedAt = new Date('2020-05-02T23:10:15.000Z')
        const signature = new Signature('signature', 'sig-pub-key')
        expectedTransaction.signatures = [signature]

        return expect(txSerializer.dataToTransaction({
            'u': {
                'l': 'login',
                'pk': 'pub-key'
            },
            't': 'U',
            'p': {
                'l': 'login',
                'pk': 'pub-key'
            },
            'h': 'hash',
            'd': '2020-05-02T23:10:15.000Z',
            's': [
                {
                    'sg': 'signature',
                    'pk': 'sig-pub-key'
                }
            ]
        }, true)).toStrictEqual(expectedTransaction)
    })

    test('Data to transaction - non-local', () => {
        const creator = new User('login', 'pub-key')
        const expectedTransaction = new Transaction(
            creator,
            UserTransactionType.t,
            creator,
            'hash'
        )
        const signature = new Signature('signature', 'sig-pub-key')
        expectedTransaction.signatures = [signature]

        return expect(txSerializer.dataToTransaction({
            'u': {
                'l': 'login',
                'pk': 'pub-key'
            },
            't': 'U',
            'p': {
                'l': 'login',
                'pk': 'pub-key'
            },
            'h': 'hash',
            'd': '2020-05-02T23:10:15.000Z',
            's': [
                {
                    'sg': 'signature',
                    'pk': 'sig-pub-key'
                }
            ]
        }, false)).toStrictEqual(expectedTransaction)
    })

    test('Transaction to data - local', () => {
        const creator = new User('login', 'pub-key')
        const transaction = new Transaction(
            creator,
            UserTransactionType.t,
            creator,
            'hash'
        )
        transaction.storedAt = new Date('2020-05-02T23:10:15.000Z')
        const signature = new Signature('signature', 'sig-pub-key')
        transaction.signatures = [signature]

        return expect(txSerializer.transactionToData(transaction, true))
            .toStrictEqual({
                'u': {
                    'l': 'login',
                    'pk': 'pub-key'
                },
                't': 'U',
                'p': {
                    'l': 'login',
                    'pk': 'pub-key'
                },
                'h': 'hash',
                'd': '2020-05-02T23:10:15.000Z',
                's': [
                    {
                        'sg': 'signature',
                        'pk': 'sig-pub-key'
                    }
                ]
            })
    })

    test('Transaction to data - non-local', () => {
        const creator = new User('login', 'pub-key')
        const transaction = new Transaction(
            creator,
            UserTransactionType.t,
            creator,
            'hash'
        )
        transaction.storedAt = new Date('2020-05-02T23:10:15.000Z')
        const signature = new Signature('signature', 'sig-pub-key')
        transaction.signatures = [signature]

        return expect(txSerializer.transactionToData(transaction, false))
            .toStrictEqual({
                'u': {
                    'l': 'login',
                    'pk': 'pub-key'
                },
                't': 'U',
                'p': {
                    'l': 'login',
                    'pk': 'pub-key'
                },
                'h': 'hash',
                's': [
                    {
                        'sg': 'signature',
                        'pk': 'sig-pub-key'
                    }
                ]
            })
    })
})
