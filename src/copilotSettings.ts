import { ConnectionSettings } from '@microsoft/agents-copilotstudio-client'
import type { AppConfig } from './config'

export function createConnectionSettings(config: AppConfig): ConnectionSettings {
  const settings = new ConnectionSettings({
    environmentId: config.environmentId,
    schemaName: config.schemaName,
    agentIdentifier: config.schemaName,
    appClientId: config.appClientId,
    tenantId: config.tenantId,
    authority: 'https://login.microsoftonline.com',
  })

  settings.appClientId = config.appClientId
  settings.tenantId = config.tenantId
  settings.authority = 'https://login.microsoftonline.com'
  return settings
}
