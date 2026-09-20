import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser'
import {
  CopilotStudioClient,
  type ConnectionSettings,
} from '@microsoft/agents-copilotstudio-client'

let msalInstance: PublicClientApplication | null = null
let msalKey: string | null = null

export async function getMsalInstance(appClientId: string, tenantId: string) {
  const key = `${appClientId}:${tenantId}`
  if (msalInstance && msalKey === key) {
    return msalInstance
  }

  msalInstance = new PublicClientApplication({
    auth: {
      clientId: appClientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'localStorage',
    },
  })
  await msalInstance.initialize()
  msalKey = key
  return msalInstance
}

function loginRequest(settings: ConnectionSettings) {
  return {
    scopes: [CopilotStudioClient.scopeFromSettings(settings)],
    redirectUri: window.location.origin,
  }
}

async function tokenFromAccount(
  msal: PublicClientApplication,
  settings: ConnectionSettings,
  account: AccountInfo,
): Promise<AuthenticationResult> {
  const request = loginRequest(settings)
  try {
    return await msal.acquireTokenSilent({ ...request, account })
  } catch (error) {
    if (!(error instanceof InteractionRequiredAuthError)) {
      throw error
    }
    return msal.acquireTokenPopup({ ...request, account })
  }
}

export async function trySilentLogin(settings: ConnectionSettings) {
  const msal = await getMsalInstance(settings.appClientId!, settings.tenantId!)
  const account = msal.getAllAccounts()[0]
  if (!account) {
    return null
  }
  const result = await tokenFromAccount(msal, settings, account)
  return {
    token: result.accessToken,
    account: result.account ?? account,
  }
}

export async function loginWithPopup(settings: ConnectionSettings) {
  const msal = await getMsalInstance(settings.appClientId!, settings.tenantId!)
  const request = loginRequest(settings)
  const existing = msal.getAllAccounts()[0]

  const result = existing
    ? await tokenFromAccount(msal, settings, existing)
    : await msal.loginPopup(request)

  if (!result.accessToken) {
    throw new Error('Microsoft login succeeded but no access token was returned.')
  }

  return {
    token: result.accessToken,
    account: result.account ?? existing,
  }
}

export async function logout(appClientId: string, tenantId: string) {
  const msal = await getMsalInstance(appClientId, tenantId)
  const account = msal.getAllAccounts()[0]
  if (account) {
    await msal.logoutPopup({ account })
  }
}
