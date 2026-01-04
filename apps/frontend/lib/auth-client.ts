import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // baseURL: process.env.NEXT_PUBLIC_APP_URL,
  baseURL: 'http://localhost:3000',
  fetchOptions: {
    credentials: 'include',
  },
  // plugins: [
  //   {
  //     id: 'next-cookies-request',
  //     fetchPlugins: [
  //       {
  //         id: 'next-cookies-request-plugin',
  //         name: 'next-cookies-request-plugin',
  //         hooks: {
  //           async onRequest(ctx) {
  //             if (typeof window === 'undefined') {
  //               const { cookies } = await import('next/headers');
  //               const headers = await cookies();
  //               ctx.headers.set('cookie', headers.toString());
  //             }
  //           },
  //         },
  //       },
  //     ],
  //   },
  // ],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
