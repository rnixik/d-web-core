import { User } from '../../src/models/User'
import { UserTransactionType } from '../../src/transactions/User/UserTransactionType'
import { Transaction } from '../../src/models/Transaction'
import { IgnoreAndBlockFilterService } from '../../src/services/IgnoreAndBlockFilterService'
import { PreferencesStorageServiceInterface } from '../../src/types/PreferencesStorageServiceInterface'
import { PreferencesIgnoreAndBlock } from '../../src/models/PreferencesIgnoreAndBlock'

let blackListsEnabled = true
let whiteListsEnabled = false

const users: User[] = []
const transactions: Transaction[] = []

for (let i = 0; i < 10; i += 1) {
    const user = new User('login-' + i, 'pub-key-' + i)
    users.push(user)
    transactions.push(
        new Transaction(user, UserTransactionType.t, user, 'hash-' + i)
    )
}

class MockPreferencesStorageService implements PreferencesStorageServiceInterface {
    getPreferencesIgnoreAndBlock(): PreferencesIgnoreAndBlock {
        return new PreferencesIgnoreAndBlock(
            [users[0], users[1]],
            [users[2], users[3]],
            blackListsEnabled,
            whiteListsEnabled,
            [users[4], users[5]],
            [users[6], users[7]],
            blackListsEnabled,
            whiteListsEnabled
        )
    }

    storePreferencesIgnoreAndBlock(preferences: PreferencesIgnoreAndBlock): void {
    }
}

const filterService = new IgnoreAndBlockFilterService(new MockPreferencesStorageService())

describe('IgnoreAndBlockFilterService', () => {
    test('Filter blocked b1 w0', () => {
        blackListsEnabled = true
        whiteListsEnabled = false
        const filtered = filterService.filterBlocked(transactions)
        expect(filtered.length).toBe(8)
    })
})
