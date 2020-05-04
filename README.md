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

## Architecture

Users connect peer-to-peer using WebRTC with signaling server or direct
exchanging signaling messages.

Peers exchange data wrapped into transactions. 
Each transaction has payload data, information about the creator of transaction,
crypto-hash of transaction and signatures of this transaction by the creator and other users.

Data stored in LocalStorage.

Before saving any transaction on any peer it should be validated by set of rules 
which are the same for every peer.
The validation consist of:
* Base validation: non-empty creator, valid hash and valid signature of a creator.
* Validation which is specific for a data type.

Any user can **block** or **ignore** any other user:
* If a user 1 blocks a user 2, the user 1 do not store transactions created by the user 2;
* if a user 1 ignores a user 2, the user 1 do not see transactions created by the user 2.

Blocking is for the cheaters and spammers, ignorance is for an unwilling content of the regular users.
There are blacklists and whitelists for both types.

To exchange an entity in a transaction it should be represented by:
* `TransactionModel` - class with data of the entity.
* `TransactionType` - class with one property `t` - unique name of the entity.
* `ModelSerializer` - class which converts the model into a string and back to store and to send it.
* `SpecificValidator` - class which validates the model before sending and storing it.

Serializer and Validator should be registered in `TransactionTypeResolver`.

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

## License

    The MIT License

    Copyright (C) 2020 Roman Nix

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
