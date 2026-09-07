import { initTsrReactQuery } from '@ts-rest/react-query/v5'
import { contract } from '@demo/shared-contract'

export const api = initTsrReactQuery(contract, { baseUrl: '' })
