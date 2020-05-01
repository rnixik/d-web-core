import { SpecificValidator } from './SpecificValidator'

export interface TypeToValidatorMap {
  [type: string]: SpecificValidator
}
