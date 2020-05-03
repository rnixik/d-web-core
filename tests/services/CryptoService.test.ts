import { CryptoService } from '../../src/services/CryptoService'
import { TransactionTypeResolver } from '../../src/services/TransactionTypeResolver'
import { AuthenticatedUser } from '../../src/models/AuthenticatedUser'
import { User } from '../../src/models/User'
import { UserTransactionType } from '../../src/transactions/User/UserTransactionType'
import { Transaction } from '../../src/models/Transaction'
import { Signature } from '../../src/models/Signature'

const typeResolver = new TransactionTypeResolver()
const cryptoService = new CryptoService(typeResolver)
cryptoService.hashLength = 24

describe('Crypto service', () => {
    test('Get user by login and password', () => {
        const expectedUser = new AuthenticatedUser(
            'login',
            'fqkOPqtfYY3jm/YawNNgjX5IgDIThJAIQfAKKioNg9Y=',
            'cGFzc3dvcmRsb2dpbgEBAQEBAQEBAQEBAQEBAQEBAQF+qQ4+q19hjeOb9hrA02CNfkiAMhOEkAhB8AoqKg2D1g=='
        )

        return expect(cryptoService.getUserByLoginAndPassword('login', 'password'))
            .toStrictEqual(expectedUser)
    })

    test('Calculate transaction hash', () => {
        const creator = new User(
            'login',
            'pub-key',
        )

        const otherUser = new User(
            'other-login',
            'other-pub-key',
        )

        return expect(cryptoService.calculateTransactionHash(creator, UserTransactionType.t, otherUser))
            .toStrictEqual('jWOVsad/0ROvdOEJTr86PCXSdK4QKbGb')
    })

    test('Sign transaction', () => {
        const signer = new AuthenticatedUser(
            'login',
            'fqkOPqtfYY3jm/YawNNgjX5IgDIThJAIQfAKKioNg9Y=',
            'cGFzc3dvcmRsb2dpbgEBAQEBAQEBAQEBAQEBAQEBAQF+qQ4+q19hjeOb9hrA02CNfkiAMhOEkAhB8AoqKg2D1g=='
        )

        const otherUser = new User(
            'other-login',
            'other-pub-key',
        )

        const tx = new Transaction(signer.getPublicUser(), UserTransactionType.t, otherUser, 'jWOVsad/0ROvdOEJTr86PCXSdK4QKbGb')

        const signedTx = cryptoService.signTransaction(signer, tx)
        const expectedSignature = new Signature(
            'fn2gcceHGl/L+W5vAOrzZ6g1VsEMXWSObR/5uFuQXzPsXddaFx1XDUMJ0jlXju6GCpuWABLnqAzribvkUfnpBg==',
            'fqkOPqtfYY3jm/YawNNgjX5IgDIThJAIQfAKKioNg9Y='
        )

        expect(signedTx.signatures.length).toBe(1)
        expect(signedTx.signatures[0]).toStrictEqual(expectedSignature)
    })

    test('Verify valid signature', () => {
        const signer = new AuthenticatedUser(
            'login',
            'fqkOPqtfYY3jm/YawNNgjX5IgDIThJAIQfAKKioNg9Y=',
            'cGFzc3dvcmRsb2dpbgEBAQEBAQEBAQEBAQEBAQEBAQF+qQ4+q19hjeOb9hrA02CNfkiAMhOEkAhB8AoqKg2D1g=='
        )

        const otherUser = new User(
            'other-login',
            'other-pub-key',
        )

        const tx = new Transaction(signer.getPublicUser(), UserTransactionType.t, otherUser, 'jWOVsad/0ROvdOEJTr86PCXSdK4QKbGb')
        const signature = new Signature(
            'fn2gcceHGl/L+W5vAOrzZ6g1VsEMXWSObR/5uFuQXzPsXddaFx1XDUMJ0jlXju6GCpuWABLnqAzribvkUfnpBg==',
            'fqkOPqtfYY3jm/YawNNgjX5IgDIThJAIQfAKKioNg9Y='
        )

        expect(cryptoService.verifySignature(tx, signature)).toBeTruthy()
    })

    test('Verify invalid signature', () => {
        const signer = new AuthenticatedUser(
            'login',
            'fqkOPqtfYY3jm/YawNNgjX5IgDIThJAIQfAKKioNg9Y=',
            'cGFzc3dvcmRsb2dpbgEBAQEBAQEBAQEBAQEBAQEBAQF+qQ4+q19hjeOb9hrA02CNfkiAMhOEkAhB8AoqKg2D1g=='
        )

        const otherUser = new User(
            'other-login',
            'other-pub-key',
        )

        const tx = new Transaction(signer.getPublicUser(), UserTransactionType.t, otherUser, 'jWOVsad/0ROvdOEJTr86PCXSdK4QKbGb')
        const signature = new Signature(
            'cGFzc3dvcmRsb2dpbgEBAQEBAQEBAQEBAQEBAQEBAQF+qQ4+q19hjeOb9hrA02CNfkiAMhOEkAhB8AoqKg2D1g==',
            'fqkOPqtfYY3jm/YawNNgjX5IgDIThJAIQfAKKioNg9Y='
        )

        expect(cryptoService.verifySignature(tx, signature)).toBeFalsy()
    })
})
