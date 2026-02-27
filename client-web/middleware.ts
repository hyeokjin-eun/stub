import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 로그인 페이지는 스킵
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // NextAuth JWT 토큰 가져오기
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 인증되지 않은 사용자는 로그인으로
  if (!token && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 인증된 사용자: 온보딩 체크
  if (token) {
    const onboardingCompleted = (token.backendUser as any)?.onboarding_completed

    // 온보딩 미완료 + 온보딩 페이지가 아니면 온보딩으로 리다이렉트
    if (!onboardingCompleted && pathname !== '/onboarding') {
      const onboardingUrl = new URL('/onboarding', request.url)
      return NextResponse.redirect(onboardingUrl)
    }

    // 온보딩 완료 + 온보딩 페이지 접근시 홈으로 리다이렉트
    if (onboardingCompleted && pathname === '/onboarding') {
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/catalog/:path*',
    '/my/:path*',
    '/search/:path*',
    '/onboarding',
  ],
}
