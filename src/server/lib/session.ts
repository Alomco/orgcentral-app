import { headers } from 'next/headers';
import { auth } from './auth';

/**
 * Get the current Better Auth session from the request context.
 * Returns null if not authenticated.
 */
export async function getBetterAuthSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session;
}

/**
 * Get the current session or throw — use in server actions that require auth.
 */
export async function requireBetterAuthSession() {
    const session = await getBetterAuthSession();
    if (!session) {
        throw new Error('Not authenticated');
    }
    return session;
}
