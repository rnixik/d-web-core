# D-WEB-CORE

Users, transactions, validations and storage for decentralized web applications

See demo decentralized web application [https://github.com/rnixik/d-web-radio](https://github.com/rnixik/d-web-radio)

## Problems and solutions

* Use service without installing desktop applications - web application.
* Use service without installing browser extensions - plain javascript applications.
* Do not pay for application servers - users connect peer-to-peer.
* Do not pay for data base servers - data stored on peers.
* Do not trust any subset of users - the same data validated and stored 
  on every peer by the same rules for every peer (decentralized application).
* Have ability to overcome cheating and flooding - block and ignore users.

## Components

This section describes the main components of the core.

### User

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

### AuthenticatedUser

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
