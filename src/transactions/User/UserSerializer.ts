import { ModelSerializer } from 'types/ModelSerializer'
import { TransactionModel } from 'types/TransactionModel'
import { User } from 'models/User'

export class UserSerializer implements ModelSerializer {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  modelToPayload (payload: User): any {
    return {
      'l': payload.login,
      'pk': payload.publicKey
    }
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  fromPayloadToModel (data: any): TransactionModel {
    return new User(data['l'], data['pk'])
  }
}
