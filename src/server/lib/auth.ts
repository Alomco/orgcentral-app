import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { organization } from 'better-auth/plugins';
import { prisma } from './prisma';

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

export const auth = betterAuth({
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    advanced: {
        database: {
            generateId: () => randomUUID(),
        },
    },
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    user: { modelName: 'authUser' },
    session: { modelName: 'authSession' },
    account: { modelName: 'authAccount' },
    verification: { modelName: 'verification' },
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        organization({
            schema: {
                organization: { modelName: 'authOrganization' },
                member: { modelName: 'authOrgMember' },
                invitation: { modelName: 'authOrgInvitation' },
                session: {
                    fields: {
                        activeOrganizationId: 'activeOrganizationId',
                    },
                },
            },
        }),
        nextCookies(),
    ],
});

export type Session = typeof auth.$Infer.Session;
