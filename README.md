# D-WEB-CORE

Users, transactions, validations and storage for distributed web applications

See demo distributed web application [https://github.com/rnixik/d-web-radio](https://github.com/rnixik/d-web-radio)

## User

`User` implements `TransactionModel` interface. 
It means it can be stored and sent as part of Transaction.

Attributes:
* login
* publicKey

As any `TransactionModel` `User` has Serializer and Validator

The core has default `UserValidator` which can validate
the length of login and uniqueness of public key.
It does not validate uniqueness of login.

`AuthenticatedUser` should be used to work with private key.

## AuthenticatedUser

A user registers with a login and password.
The core generates private / public key pair based on the login and password.

```typescript
const cryptoService = new CryptoService(...)
const authenticatedUser = cryptoService.getUserByLoginAndPassword(login, password)
```

Attributes:
* login
* publicKey
* privateKey

`AuthenticatedUser` is not stored in any persistent storage.
`AuthenticatedUser` is used to sign transactions.
`User` can be get from `AuthenticatedUser` with method `getPublicUser()`:

```typescript
const authenticatedUser = new AuthenticatedUser(...)
const user = authenticatedUser.getPublicUser()
```

Documentation is in progress
