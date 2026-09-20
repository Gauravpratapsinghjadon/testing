import { useState, type FormEvent } from 'react'
import type { AppConfig } from '../config'
import { draftConfig, saveConfig } from '../config'

type SetupPageProps = {
  onSaved: (config: AppConfig) => void
}

export function SetupPage({ onSaved }: SetupPageProps) {
  const [form, setForm] = useState<AppConfig>(draftConfig)

  function update(field: keyof AppConfig, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const config: AppConfig = {
      appClientId: form.appClientId.trim(),
      tenantId: form.tenantId.trim(),
      environmentId: form.environmentId.trim(),
      schemaName: form.schemaName.trim(),
    }
    saveConfig(config)
    onSaved(config)
  }

  return (
    <div className="page">
      <div className="card">
        <p className="eyebrow">Copilot Studio</p>
        <h1>Connect your agent</h1>
        <p className="lede">
          Enter the Environment ID, Schema name, Client ID, and Tenant ID. After
          that you will sign in with Microsoft and the bot will open.
        </p>

        <form className="form" onSubmit={onSubmit}>
          <label>
            Environment ID
            <input
              value={form.environmentId}
              onChange={(event) => update('environmentId', event.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
              autoComplete="off"
            />
          </label>
          <label>
            Schema name
            <input
              value={form.schemaName}
              onChange={(event) => update('schemaName', event.target.value)}
              placeholder="cr123_myagent"
              required
              autoComplete="off"
            />
          </label>
          <label>
            Client ID
            <input
              value={form.appClientId}
              onChange={(event) => update('appClientId', event.target.value)}
              placeholder="Azure app registration client ID"
              required
              autoComplete="off"
            />
          </label>
          <label>
            Tenant ID
            <input
              value={form.tenantId}
              onChange={(event) => update('tenantId', event.target.value)}
              placeholder="Azure directory tenant ID"
              required
              autoComplete="off"
            />
          </label>
          <button className="primary" type="submit">
            Continue to login
          </button>
        </form>
      </div>
    </div>
  )
}
