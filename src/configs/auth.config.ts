import type { NextAuthConfig } from 'next-auth'

/**
 * Base auth config — edge-safe (no Node.js-only imports).
 * Used by the middleware. Providers are added in src/auth.ts.
 */
export default {
    providers: [],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.authority = user.authority
            }
            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub,
                },
            }
        },
    },
} satisfies NextAuthConfig
