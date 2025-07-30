export type UserType = 'student' | 'counselor' | 'admin';

export interface User {
  readonly id: string;
  email: string;
  name: string;
  userType: UserType;
  profileImage?: string;
  readonly createdAt: string;
}

export type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserRequest = Partial<Pick<User, 'name' | 'profileImage'>>;
