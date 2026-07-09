import { firestoreService } from '@/lib/firestore';
import { User } from '@/types';

const USERS_COLLECTION = 'users';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    return (await firestoreService.getAll(USERS_COLLECTION)) as User[];
  },

  async getUserById(id: string): Promise<User | null> {
    return (await firestoreService.getById(USERS_COLLECTION, id)) as User | null;
  },

  async updateUserProfile(id: string, data: Partial<User>): Promise<void> {
    await firestoreService.update(USERS_COLLECTION, id, data);
    
    // Also update sync for current user if applicable
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('auth_current_user');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        if (parsed.id === id) {
          localStorage.setItem('auth_current_user', JSON.stringify({ ...parsed, ...data }));
          window.dispatchEvent(new Event('storage'));
        }
      }
    }
  },

  async deleteUser(id: string): Promise<void> {
    await firestoreService.delete(USERS_COLLECTION, id);
  }
};
