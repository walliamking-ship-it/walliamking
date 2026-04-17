import { NextRequest, NextResponse } from 'next/server';
import { UserRepo, EmployeeRepo } from '@/lib/repo';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: '登录已过期' },
        { status: 401 }
      );
    }

    const user = await UserRepo.findById(payload.userId);
    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { error: '用户不存在或已停用' },
        { status: 401 }
      );
    }

    const employee = await EmployeeRepo.findById(user.employeeId);

    return NextResponse.json({
      id: user.id,
      username: user.username,
      roleKey: user.roleKey,
      employeeId: user.employeeId,
      employeeName: employee?.name || '',
    });
  } catch (err) {
    console.error('Get current user error:', err);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
