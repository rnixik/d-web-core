import { ModelSerializer } from './ModelSerializer'

export interface TypeToSerializerMap {
  [type: string]: ModelSerializer
}
