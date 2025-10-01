import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user.id.toString(), name: user.name, email: user.email, role: user.role }
        }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = parseInt(token.sub)
        session.user.role = token.role
        // Include profile image from database if not already set
        if (!session.user.image) {
          const user = await prisma.user.findUnique({
            where: { id: parseInt(token.sub) },
            select: { profileImage: true }
          })
          session.user.image = user?.profileImage || null
        }
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: '/login'
  }
}

export default NextAuth(authOptions)