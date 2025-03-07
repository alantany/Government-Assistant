import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // 验证用户名和密码
    if (username === 'alantany' && password === 'Mikeno01') {
      // 创建响应
      const response = NextResponse.json({ 
        success: true,
        message: '登录成功'
      })

      // 设置cookie
      response.cookies.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24小时
      })

      return response
    }

    return NextResponse.json(
      { error: '用户名或密码错误' },
      { status: 401 }
    )
  } catch (error) {
    console.error('登录处理错误:', error)
    return NextResponse.json(
      { error: '登录失败，请重试' },
      { status: 500 }
    )
  }
} 