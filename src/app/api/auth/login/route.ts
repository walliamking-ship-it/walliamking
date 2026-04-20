import { NextRequest, NextResponse } from 'next/server';
import { UserRepo } from '@/lib/repo';
import { verifyPassword, signToken } from '@/lib/auth';
import { EmployeeRepo } from '@/lib/repo';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await UserRepo.findByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: '账号已被停用' },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 获取关联的员工信息
    const employee = await EmployeeRepo.findById(user.employeeId);

    // 生成JWT
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.roleKey,
    });

    // 返回用户信息（不含密码）和token
    const userInfo = {
      id: user.id,
      username: user.username,
      roleKey: user.roleKey,
      employeeId: user.employeeId,
      employeeName: employee?.name || '',
      lastLogin: user.lastLogin,
    };

    // 创建响应
    const response = NextResponse.json({
      token,
      user: userInfo,
    });

    // 同时设置HTTP-only cookie（用于服务端路由保护）
    response.cookies.set('erp_token', token, {
      httpOnly: true,
      secure: false, // HTTP环境不使用Secure标志
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8小时
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
