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
        expect(filtered).not.toContain(transactions[0])
        expect(filtered).not.toContain(transactions[1])
    })

    test('Filter blocked b0 w1', () => {
        blackListsEnabled = false
        whiteListsEnabled = true
        const filtered = filterService.filterBlocked(transactions)
        expect(filtered.length).toBe(2)
        expect(filtered).toContain(transactions[2])
        expect(filtered).toContain(transactions[3])
    })

    test('Filter blocked b1 w1', () => {
        blackListsEnabled = true
        whiteListsEnabled = true
        const filtered = filterService.filterBlocked(transactions)
        expect(filtered.length).toBe(2)
        expect(filtered).toContain(transactions[2])
        expect(filtered).toContain(transactions[3])
    })

    test('Filter ignored b1 w0', () => {
        blackListsEnabled = true
        whiteListsEnabled = false
        const filtered = filterService.filterIgnored(transactions)
        expect(filtered.length).toBe(8)
        expect(filtered).not.toContain(transactions[4])
        expect(filtered).not.toContain(transactions[5])
    })

    test('Filter ignored b0 w1', () => {
        blackListsEnabled = false
        whiteListsEnabled = true
        const filtered = filterService.filterIgnored(transactions)
        expect(filtered.length).toBe(2)
        expect(filtered).toContain(transactions[6])
        expect(filtered).toContain(transactions[7])
    })

    test('Filter ignored b1 w1', () => {
        blackListsEnabled = true
        whiteListsEnabled = true
        const filtered = filterService.filterIgnored(transactions)
        expect(filtered.length).toBe(2)
        expect(filtered).toContain(transactions[6])
        expect(filtered).toContain(transactions[7])
    })
})
