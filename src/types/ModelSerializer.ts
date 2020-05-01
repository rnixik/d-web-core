import { TransactionModel } from 'types/TransactionModel'
import { User } from 'models/User'

export interface ModelSerializer {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  modelToPayload(model: TransactionModel, local: boolean): any
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  fromPayloadToModel(payload: any, creator: User, local: boolean): TransactionModel
}
