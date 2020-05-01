import { ModelSerializer } from './ModelSerializer'
import { SpecificValidator } from './SpecificValidator'

export interface TransactionTypeResolverInterface {
  getPayloadSerializer (transactionType: string): ModelSerializer
  setPayloadSerializer (transactionType: string, payloadSerializer: ModelSerializer): void
  getSpecificValidator (transactionType: string): SpecificValidator
  setSpecificValidator (transactionType: string, specificValidator: SpecificValidator): void
}
