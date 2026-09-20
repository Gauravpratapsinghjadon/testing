/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_CLIENT_ID: string
  readonly VITE_TENANT_ID: string
  readonly VITE_ENVIRONMENT_ID: string
  readonly VITE_SCHEMA_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
