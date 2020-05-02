import { UserSerializer } from '../../../src/transactions/User/UserSerializer'
import { User } from '../../../src/models/User'

const serializer = new UserSerializer()

describe('User serializer', () => {
    test('Serialize', () => {
        const user = new User('login', 'pub-key')

        return expect(serializer.modelToPayload(user))
            .toStrictEqual({
                'l': 'login',
                'pk': 'pub-key'
            })
    })

    test('Deserialize', () => {
        const payload = {
            'l': 'login',
            'pk': 'pub-key',
            'extra-key': 'extra-value'
        }
        const user = new User('login', 'pub-key')

        return expect(serializer.fromPayloadToModel(payload))
            .toStrictEqual(user)
    })
})
