import { defineConfig } from 'orval'

export default defineConfig({
  honoDemo: {
    input: { target: 'http://localhost:3201/openapi' },
    output: {
      client: 'react-query',
      httpClient: 'fetch',
      target: 'src/api/generated.ts',
      baseUrl: '',
    },
  },
})
