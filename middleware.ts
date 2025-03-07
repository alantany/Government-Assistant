import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 获取请求路径
  const path = request.nextUrl.pathname

  // 如果是访问admin路径
  if (path.startsWith('/admin')) {
    // 检查登录状态
    const isLoggedIn = request.cookies.get('admin_token')
    
    if (!isLoggedIn) {
      // 如果未登录且不是登录页面，重定向到登录页面
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 