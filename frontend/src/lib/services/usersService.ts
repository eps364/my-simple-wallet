
import { User, UserCreateRequest, UserUpdateRequest } from '@/lib/types/user';
import { apiRequest, fetchConfig } from './baseService';

export class UsersService {
  private readonly endpoint = '/users';

  async getProfile(): Promise<User> {
    const user = await apiRequest<User>(`${this.endpoint}/me`, fetchConfig());
    
    try {
      const children = await this.getChildren();
      user.isParent = children.length > 0;
    } catch {
      user.isParent = false;
    }
    
    return user;
  }

  async getUserById(id: string): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/${id}`, fetchConfig());
  }

  async updateProfile(data: UserUpdateRequest): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me`, fetchConfig('PUT', data));
  }

  async updatePassword(password: string): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me/password`, fetchConfig('PATCH', { password }));
  }

  async getChildren(): Promise<User[]> {
    return apiRequest<User[]>(`${this.endpoint}/me/parent`, fetchConfig());
  }

  async updateParent(parentId: string): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me/parent`, fetchConfig('PATCH', { parentId }));
  }

  async removeParent(): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/me/parent`, fetchConfig('PATCH', { parentId: null }));
  }

  async addChild(childId: string): Promise<User> {
    const currentUser = await this.getProfile();
    return apiRequest<User>(`${this.endpoint}/${childId}/parent`, fetchConfig('PATCH', { parentId: currentUser.id }));
  }

  async removeChild(childId: string): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/${childId}/parent`, fetchConfig('PATCH', { parentId: null }));
  }

  async create(data: UserCreateRequest): Promise<User> {
    return apiRequest<User>(`${this.endpoint}/register`, fetchConfig('POST', data));
  }
}
  
export const usersService = new UsersService();
