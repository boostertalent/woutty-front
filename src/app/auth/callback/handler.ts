export type CallbackParams = {
  url: string
}

export function resolveCallbackRedirect({ url }: CallbackParams) {
  const parsedUrl = new URL(url)
  const origin = parsedUrl.origin

  const code = parsedUrl.searchParams.get('code')
  const next = parsedUrl.searchParams.get('next') || '/'

  const safeNext = next.startsWith('/') ? next : '/'

  if (!code) {
    return `${origin}/auth/auth-code-error`
  }

  return `${origin}${safeNext}`
}
