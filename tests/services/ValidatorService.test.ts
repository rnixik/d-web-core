import { ValidatorService } from '../../src/services/ValidatorService'
import { TransactionTypeResolver } from '../../src/services/TransactionTypeResolver'
import { User } from '../../src/models/User'
import { UserTransactionType } from '../../src/transactions/User/UserTransactionType'
import { Transaction } from '../../src/models/Transaction'
import { Signature } from '../../src/models/Signature'
import { CryptoService } from '../../src/services/CryptoService'
import { SpecificValidator } from '../../src/types/SpecificValidator'

const typeResolver = new TransactionTypeResolver()
const cryptoService = new CryptoService(typeResolver)
const validatorService = new ValidatorService(cryptoService, typeResolver)

const creator1 = new User('login-1', 'G3u1naNBOKuQsI9pAH0vj9tDYy1KsWE87kJSFvfRI+o=')
const transaction1 = new Transaction(
    creator1,
    UserTransactionType.t,
    creator1,
    'X74UVFa6w9PBqVldPkuxJA=='
)
transaction1.signatures = [
    new Signature(
        'Zvp3w15ZXewS7rRKPnGwaqo8jo3Vv8iglykjSKbD8eB82ZSmWZ0mahNxgAxdTtXTwWL1/RSgXoUYVBwwGgxoBw==',
        'G3u1naNBOKuQsI9pAH0vj9tDYy1KsWE87kJSFvfRI+o='
    )
]

const storedTransactions = [ transaction1 ]

const creator2 = new User('login-2', '7W+ZX2o10HClJt8cqUG/Mcmy99kBn1dZ52gUNAwNK34=')
const transaction2 = new Transaction(
    creator2,
    UserTransactionType.t,
    creator2,
    'H+vvjxkHueehCfLK2e7hGg=='
)
transaction2.signatures = [
    new Signature(
        'ukW13F5iaYYIf60/3oZFaN0syFhdn06MiXG4iXE6GH0LxDlhmMLYHzxmAOZ38VTl2dHb9hdxz4kkQWS9kNtvCQ==',
        '7W+ZX2o10HClJt8cqUG/Mcmy99kBn1dZ52gUNAwNK34='
    )
]

describe('Validator service', () => {
    test('Validate base - normal', () => {
        expect(() => {
            validatorService.validateBase(storedTransactions, transaction2)
        }).not.toThrow()
    })

    test('Validate base - invalid hash', () => {
        const transaction = new Transaction(
            transaction2.creator,
            transaction2.type,
            transaction2.model,
            'wrong-hash'
        )
        expect(() => {
            validatorService.validateBase(storedTransactions, transaction)
        }).toThrow('Invalid hash')
    })

    test('Validate base - no signatures', () => {
        const transaction = new Transaction(
            transaction2.creator,
            transaction2.type,
            transaction2.model,
            transaction2.hash
        )
        expect(() => {
            validatorService.validateBase(storedTransactions, transaction)
        }).toThrow('No signatures')
    })

    test('Validate base - Wrong first signature', () => {
        const transaction = new Transaction(
            transaction2.creator,
            transaction2.type,
            transaction2.model,
            transaction2.hash
        )
        transaction.signatures = [ transaction1.signatures[0] ]
        expect(() => {
            validatorService.validateBase(storedTransactions, transaction)
        }).toThrow('Wrong first signature')
    })

    test('Validate base - Invalid signature', () => {
        const transaction = new Transaction(
            transaction2.creator,
            transaction2.type,
            transaction2.model,
            transaction2.hash
        )
        const signature = new Signature(
            transaction1.signatures[0].signature,
            transaction2.signatures[0].publicKey
        )
        transaction.signatures = [ signature ]
        expect(() => {
            validatorService.validateBase(storedTransactions, transaction)
        }).toThrow('Invalid signature')
    })

    test('Validate base - Creator of transactions not found', () => {
        const otherCreator = new User('login-3', 'BxIJ+A3s2PgylmmFmRVFCuIEkmrTCO/WmD+FFcagLuw=')
        const transaction = new Transaction(
            otherCreator,
            'test',
            creator2,
            'hash-3'
        )
        transaction.signatures = [
            new Signature('signature-3', otherCreator.publicKey)
        ]

        jest.spyOn(cryptoService, 'calculateTransactionHash')
            .mockImplementation(() => 'hash-3')
        jest.spyOn(cryptoService, 'verifySignature')
            .mockImplementation(() => true)

        expect(() => {
            validatorService.validateBase(storedTransactions, transaction)
        }).toThrow('Creator of transactions not found')
    })

    test('Validate base - Login mismatch of creator', () => {
        const otherCreator = new User(
            'login-3',
            creator1.publicKey
        )
        const transaction = new Transaction(
            otherCreator,
            'test',
            creator2,
            'hash-3'
        )
        transaction.signatures = [
            new Signature('signature-3', otherCreator.publicKey)
        ]

        jest.spyOn(cryptoService, 'calculateTransactionHash')
            .mockImplementation(() => 'hash-3')
        jest.spyOn(cryptoService, 'verifySignature')
            .mockImplementation(() => true)

        expect(() => {
            validatorService.validateBase(storedTransactions, transaction)
        }).toThrow('Login mismatch of creator')
    })

    test('Calls specific validate', () => {
        const transaction = new Transaction(
            creator1,
            'test',
            creator2,
            'hash'
        )

        class TestValidator implements SpecificValidator {
            validate(storedTransactions: Transaction[], tx: Transaction): Promise<void> {
                return Promise.resolve(undefined)
            }
        }
        const testSpecificValidator = new TestValidator()
        const spy = jest.spyOn(testSpecificValidator, 'validate')

        typeResolver.setSpecificValidator('test', testSpecificValidator)
        const validatorService = new ValidatorService(cryptoService, typeResolver)

        validatorService.validateSpecific(storedTransactions, transaction)
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
