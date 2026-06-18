import { createAuthClient } from 'better-auth/react'

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || undefined

const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: 'include',
  },
})

export { authClient }
