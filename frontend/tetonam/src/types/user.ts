import type { UserRole } from '@/constants/userTypes';

export interface User {
  readonly id: string;
  email: string;
  name: string;
  nickname: string;
  gender: string;
  phone: string;
  school: string;
  birthday: string;
  roles: UserRole[]; // 백엔드의 roles 배열에 맞춤
  readonly createdAt: string;
}

export type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserRequest = Partial<Pick<User, 'name' | 'nickname'>>;
