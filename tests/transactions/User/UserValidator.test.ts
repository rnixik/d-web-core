import { UserValidator } from '../../../src/transactions/User/UserValidator'
import { User } from '../../../src/models/User'
import { Transaction } from '../../../src/models/Transaction'
import { UserTransactionType } from '../../../src/transactions/User/UserTransactionType'

const validator = new UserValidator()
validator.loginMinLength = 3
validator.loginMaxLength = 10

const storedModel = new User('login-1', 'pub-key-1')
const storedTransaction = new Transaction(storedModel, UserTransactionType.t, storedModel, 'hash-1')

describe('User validator', () => {
    test.each([
        ['', 'pub-key-other', 'Empty login'],
        ['lo', 'pub-key-other', 'Login is too short'],
        ['too-long-lo', 'pub-key-other', 'Login is too long'],
        ['login-1', 'pub-key-1', 'User already registered'],
    ])('Throws error when user is incorrect: %s', (login, pubKey, errorString) => {
        const user = new User(login, pubKey)
        const tx = new Transaction(user, UserTransactionType.t, user, 'hash-other')

        return expect(async () => {
            await validator.validate([ storedTransaction ], tx)
        }).rejects.toThrow(errorString)
    })

    test('Transaction is Valid', () => {
        expect.assertions(1);

        const user = new User('login-2', 'pub-key-2')
        const tx = new Transaction(user, UserTransactionType.t, user, 'hash-2')

        return expect(validator.validate([ storedTransaction ], tx))
            .resolves
            .not.toThrow()
    })
})
