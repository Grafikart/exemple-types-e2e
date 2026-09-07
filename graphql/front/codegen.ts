import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../schema.graphql',
  documents: ['src/**/*.graphql'],
  generates: {
    'src/gql/': {
      preset: 'client',
      presetConfig: { gqlTagName: 'graphql' },
      config: { scalars: { DateTime: { input: 'string', output: 'string' } } },
    },
  },
}

export default config
