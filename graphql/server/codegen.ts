import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../schema.graphql',
  generates: {
    'src/generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../context#Context',
        mappers: {
          User: '@demo/repositories#User',
          Post: '@demo/repositories#Post',
        },
        mapperTypeSuffix: 'Model',
        scalars: { DateTime: 'string' },
      },
    },
  },
}

export default config
