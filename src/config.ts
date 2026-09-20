export type AppConfig = {
  appClientId: string
  tenantId: string
  environmentId: string
  schemaName: string
}

const STORAGE_KEY = 'copilot-studio-config'

function fromEnv(): Partial<AppConfig> {
  return {
    appClientId: import.meta.env.VITE_APP_CLIENT_ID?.trim() || '',
    tenantId: import.meta.env.VITE_TENANT_ID?.trim() || '',
    environmentId: import.meta.env.VITE_ENVIRONMENT_ID?.trim() || '',
    schemaName: import.meta.env.VITE_SCHEMA_NAME?.trim() || '',
  }
}

export function isConfigComplete(config: Partial<AppConfig> | null): config is AppConfig {
  return Boolean(
    config?.appClientId &&
      config?.tenantId &&
      config?.environmentId &&
      config?.schemaName,
  )
}

export function loadConfig(): AppConfig | null {
  const envConfig = fromEnv()
  if (isConfigComplete(envConfig)) {
    return envConfig
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return isConfigComplete(envConfig) ? envConfig : null
    }
    const stored = JSON.parse(raw) as Partial<AppConfig>
    const merged = {
      appClientId: stored.appClientId || envConfig.appClientId || '',
      tenantId: stored.tenantId || envConfig.tenantId || '',
      environmentId: stored.environmentId || envConfig.environmentId || '',
      schemaName: stored.schemaName || envConfig.schemaName || '',
    }
    return isConfigComplete(merged) ? merged : null
  } catch {
    return null
  }
}

export function saveConfig(config: AppConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function clearStoredConfig() {
  localStorage.removeItem(STORAGE_KEY)
}

export function draftConfig(): AppConfig {
  const current = loadConfig()
  if (current) {
    return current
  }
  const envConfig = fromEnv()
  return {
    appClientId: envConfig.appClientId || '',
    tenantId: envConfig.tenantId || '',
    environmentId: envConfig.environmentId || '',
    schemaName: envConfig.schemaName || '',
  }
}
