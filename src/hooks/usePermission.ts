'use client';

import { useCallback } from 'react';
import { Permission, RoleKey } from '@/lib/types';
import { hasPermission } from '@/lib/permissions';

/**
 * 从localStorage获取当前用户角色
 */
export function useCurrentRole(): RoleKey {
  if (typeof window === 'undefined') return 'viewer';
  
  const userStr = localStorage.getItem('current_user');
  if (!userStr) return 'viewer';
  
  try {
    const user = JSON.parse(userStr);
    return (user.roleKey as RoleKey) || 'viewer';
  } catch {
    return 'viewer';
  }
}

/**
 * 权限检查Hook
 * 在组件中使用，用于根据权限显示/隐藏功能
 */
export function usePermission() {
  const role = useCurrentRole();

  const can = useCallback(
    (permission: Permission): boolean => {
      return hasPermission(role, permission);
    },
    [role]
  );

  const canAny = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some(p => hasPermission(role, p));
    },
    [role]
  );

  const canAll = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.every(p => hasPermission(role, p));
    },
    [role]
  );

  return { can, canAny, canAll, role };
}
