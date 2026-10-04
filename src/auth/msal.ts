import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
  type RedirectRequest,
} from '@azure/msal-browser'
import {
  CopilotStudioClient,
  type ConnectionSettings,
} from '@microsoft/agents-copilotstudio-client'

let msalInstance: PublicClientApplication | null = null
let msalKey: string | null = null
let redirectPromise: Promise<AuthenticationResult | null> | null = null

export type AuthSession = {
  token: string
  account: AccountInfo
}

function loginRequest(settings: ConnectionSettings): RedirectRequest {
  return {
    scopes: [CopilotStudioClient.scopeFromSettings(settings)],
    redirectUri: window.location.origin,
    authority: `https://login.microsoftonline.com/${settings.tenantId}`,
  }
}

function sameTenantAccount(msal: PublicClientApplication, tenantId: string) {
  const active = msal.getActiveAccount()
  if (active?.tenantId === tenantId) {
    return active
  }
  return msal.getAllAccounts().find((account) => account.tenantId === tenantId) ?? null
}

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
      postLogoutRedirectUri: window.location.origin,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
    },
  })
  await msalInstance.initialize()
  msalKey = key
  redirectPromise = null
  return msalInstance
}

async function consumeRedirect(msal: PublicClientApplication) {
  if (!redirectPromise) {
    redirectPromise = msal.handleRedirectPromise()
  }
  return redirectPromise
}

function toSession(result: AuthenticationResult, fallback?: AccountInfo | null): AuthSession {
  const account = result.account ?? fallback
  if (!result.accessToken || !account) {
    throw new Error('Microsoft login succeeded but no account token was returned.')
  }
  return { token: result.accessToken, account }
}

async function silentFromAccount(
  msal: PublicClientApplication,
  settings: ConnectionSettings,
  account: AccountInfo,
) {
  const request = loginRequest(settings)
  return msal.acquireTokenSilent({ ...request, account })
}

export async function bootstrapAuth(settings: ConnectionSettings): Promise<
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'redirecting' }
> {
  const tenantId = settings.tenantId!
  const msal = await getMsalInstance(settings.appClientId!, tenantId)
  const request = loginRequest(settings)

  const redirectResult = await consumeRedirect(msal)
  if (redirectResult?.accessToken) {
    if (redirectResult.account) {
      msal.setActiveAccount(redirectResult.account)
    }
    return { status: 'authenticated', session: toSession(redirectResult) }
  }

  const cached = sameTenantAccount(msal, tenantId)
  if (cached) {
    msal.setActiveAccount(cached)
    try {
      const silent = await silentFromAccount(msal, settings, cached)
      return { status: 'authenticated', session: toSession(silent, cached) }
    } catch (error) {
      if (!(error instanceof InteractionRequiredAuthError)) {
        console.warn('Silent token refresh failed, redirecting to Microsoft login.', error)
      }
    }
  }

  try {
    const sso = await msal.ssoSilent({
      ...request,
      loginHint: cached?.username,
    })
    if (sso.account) {
      msal.setActiveAccount(sso.account)
    }
    return { status: 'authenticated', session: toSession(sso, cached) }
  } catch {
    // No existing tenant session in this browser; go straight to Microsoft login.
  }

  await msal.loginRedirect(request)
  return { status: 'redirecting' }
}

export async function logout(appClientId: string, tenantId: string) {
  const msal = await getMsalInstance(appClientId, tenantId)
  const account = sameTenantAccount(msal, tenantId)
  await msal.logoutRedirect({
    account: account ?? undefined,
    postLogoutRedirectUri: window.location.origin,
  })
}
