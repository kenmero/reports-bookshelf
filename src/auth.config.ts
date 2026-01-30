import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            console.log(`[Middleware] Checking: ${nextUrl.pathname}, User: ${auth?.user?.name ?? 'guest'}`);
            const isLoggedIn = !!auth?.user;
            const isOnLoginPage = nextUrl.pathname.startsWith('/login');

            if (isOnLoginPage) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl)); // Redirect to home if already logged in
                return true;
            }

            return isLoggedIn; // Require login for all other pages
        },
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.name = (user as any).username;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user && token.role) {
                session.user.role = String(token.role);
                session.user.name = token.name;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts effectively
} satisfies NextAuthConfig;
