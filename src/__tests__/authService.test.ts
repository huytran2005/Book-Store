import { describe, it, expect, beforeEach, vi } from 'vitest';

// Define window and localStorage mock before importing authService
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Set global window and localStorage
if (typeof window === 'undefined') {
  global.window = {
    dispatchEvent: () => {},
  } as any;
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

if (typeof document === 'undefined') {
  global.document = {
    cookie: '',
  } as any;
} else {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
}

// Mock firebase configuration to force mock local storage mode
vi.mock('../lib/firebase', () => ({
  auth: null,
  isFirebaseConfigured: false,
}));

// Now import the service after window and localStorage mocks are active
import { authService } from '../lib/auth';

describe('authService Unit Tests (Mock Mode)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = '';
    // Call logout to clear any local state in the service
    authService.logout();
  });

  it('should register a new user successfully', async () => {
    const user = await authService.register('testuser@gmail.com', 'password123', 'Test User');
    
    expect(user.email).toBe('testuser@gmail.com');
    expect(user.name).toBe('Test User');
    expect(user.role).toBe('user');
    expect(user.id).toBeDefined();

    const storedUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
    expect(storedUsers.length).toBe(1);
    expect(storedUsers[0].email).toBe('testuser@gmail.com');
  });

  it('should assign admin role when email contains admin', async () => {
    const adminUser = await authService.register('admin-user@gmail.com', 'password123', 'Admin User');
    expect(adminUser.role).toBe('admin');
  });

  it('should assign admin role when email ends with @bookstore.com', async () => {
    const companyAdmin = await authService.register('huy@bookstore.com', 'password123', 'Huy Trans');
    expect(companyAdmin.role).toBe('admin');
  });

  it('should prevent registering a duplicate email', async () => {
    await authService.register('duplicate@gmail.com', 'password123', 'First User');
    
    await expect(
      authService.register('duplicate@gmail.com', 'password999', 'Second User')
    ).rejects.toThrow('Email đã được đăng ký!');
  });

  it('should login an existing registered user', async () => {
    await authService.register('loginme@gmail.com', 'password123', 'Login User');
    
    const user = await authService.login('loginme@gmail.com', 'password123');
    expect(user.email).toBe('loginme@gmail.com');
    expect(user.name).toBe('Login User');
    
    const currentUser = authService.getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser?.email).toBe('loginme@gmail.com');
  });

  it('should auto-create a mock user if logging in with new credentials in mock mode', async () => {
    const user = await authService.login('newlogin@gmail.com', 'any-password');
    expect(user.email).toBe('newlogin@gmail.com');
    expect(user.role).toBe('user');
  });

  it('should clear user state upon logout', async () => {
    await authService.register('logoutme@gmail.com', 'password123', 'Logout User');
    await authService.login('logoutme@gmail.com', 'password123');
    
    expect(authService.getCurrentUser()).not.toBeNull();
    await authService.logout();
    expect(authService.getCurrentUser()).toBeNull();
  });
});
