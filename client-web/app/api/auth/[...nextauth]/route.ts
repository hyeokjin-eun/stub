import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 로그인 후 리다이렉트 처리
      // url이 callbackUrl로 지정된 경로
      // 기본적으로 / 로 가되, 온보딩 체크는 클라이언트에서 처리
      return url.startsWith(baseUrl) ? url : baseUrl
    },

    async signIn({ user, account }) {
      // Google OAuth 로그인 시 백엔드에서 JWT 발급
      if (account?.provider === 'google') {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: 'google',
              providerId: account.providerAccountId,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            console.log('[NextAuth] Backend OAuth success:', {
              hasToken: !!data.access_token,
              hasUser: !!data.user,
              userId: data.user?.id
            })
            // account 객체에 임시로 저장 (jwt 콜백으로 전달)
            ;(account as any).backendToken = data.access_token
            ;(account as any).backendUser = data.user
          } else {
            console.error('[NextAuth] Backend oauth failed with status:', res.status)
          }
        } catch (e) {
          console.error('[NextAuth] Backend oauth failed:', e)
        }
      }
      return true
    },

    async jwt({ token, account, trigger, session }) {
      // signIn 직후 account에 백엔드 토큰이 있으면 저장
      if (account?.provider === 'google' && (account as any).backendToken) {
        console.log('[NextAuth] JWT callback - storing backend token')
        token.backendToken = (account as any).backendToken
        token.backendUser = (account as any).backendUser
      }

      // 세션 업데이트 시 사용자 정보 갱신
      if (trigger === 'update' && session) {
        console.log('[NextAuth] JWT callback - updating session')
        token.backendUser = { ...(token.backendUser as object), ...session }
      }

      console.log('[NextAuth] JWT callback result:', {
        hasBackendToken: !!token.backendToken,
        hasBackendUser: !!token.backendUser
      })

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.backendUser as any)?.id?.toString() || token.sub || ''
        ;(session as any).backendToken = token.backendToken
        ;(session as any).onboardingCompleted = (token.backendUser as any)?.onboarding_completed || false
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
