import CredentialsProvider from 'next-auth/providers/credentials'
// import GithubProvider from 'next-auth/providers/github'
import { NuxtAuthHandler } from "#auth";
import { useDatabaseManager } from '../../../lib/';

const databaseManager = useDatabaseManager()

export default NuxtAuthHandler({
    // secret needed to run nuxt-auth in production mode (used to encrypt data)
    secret: process.env.NUXT_SECRET || 'nujin',
    pages: {    // Change the default behavior to use `/login` as the path for the sign-in page
      signIn: '/login'
    },
    providers: [
        // @ts-ignore Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
        // GithubProvider.default({
        //     clientId: process.env.GITHUB_CLIENT_ID,
        //     clientSecret: process.env.GITHUB_CLIENT_SECRET
        // }),
        // @ts-ignore Import is exported on .default during SSR, so we need to call it this way. May be fixed via Vite at some point
        CredentialsProvider.default({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
              username: { label: 'Username', type: 'text', placeholder: 'Username' },
              password: { label: 'Password', type: 'password', placeholder: 'Password' }
            },
            async authorize(credentials: any) {
              const admin = {
                id: '1',
                username: 'demo@ecosis.tech',
                email: 'demo@ecosis.tech',
                password: 'demo',
                image: 'https://avatars.githubusercontent.com/u/25911230?v=4',
                roles: [ 'admin' ]
              }
              // You need to provide your own logic here that takes the credentials
              // submitted and returns either a object representing a user or value
              // that is false/null if the credentials are invalid.
              // NOTE: THE BELOW LOGIC IS NOT SAFE OR PROPER FOR AUTHENTICATION!

              // Check if user exists
              const user = await databaseManager.getUserByMail(credentials.username)

              if (user) {
                // Check Password
                if (verifyPassword(credentials.password, user.password.hash, user.password.salt)) {
                  return user
                }
              } else if (credentials?.username === admin.username && credentials?.password === admin.password) {
                return admin
              } else {
                return null
              }
            }
        })
    ]
})
