import { auth, isFirebaseConfigured } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { firestoreService } from './firestore';
import { User } from '@/types';

// Provider for Google Auth
const googleProvider = new GoogleAuthProvider();

// Local helper to sync auth state to localStorage and cookies for middleware
const setCurrentUserLocal = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('auth_current_user', JSON.stringify(user));
    document.cookie = `session_role=${user.role}; path=/; max-age=604800`; // 7 days
    document.cookie = `session_logged_in=true; path=/; max-age=604800`;
  } else {
    localStorage.removeItem('auth_current_user');
    document.cookie = 'session_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'session_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  // Notify other hooks in the same window
  window.dispatchEvent(new Event('storage'));
};

export const authService = {
  // Listen for auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      const handleStorageChange = () => {
        const localUser = localStorage.getItem('auth_current_user');
        const parsedUser = localUser ? JSON.parse(localUser) : null;
        callback(parsedUser);
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorageChange);
        // Call immediately
        handleStorageChange();
      }

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', handleStorageChange);
        }
      };
    }

    // Firebase actual listener
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        let dbUser = await firestoreService.getById('users', firebaseUser.uid);
        if (!dbUser) {
          dbUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
            avatar: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString()
          };
          await firestoreService.set('users', firebaseUser.uid, dbUser);
        }
        
        setCurrentUserLocal(dbUser as User);
        callback(dbUser as User);
      } else {
        setCurrentUserLocal(null);
        callback(null);
      }
    });
  },

  // Register user
  async register(email: string, password: string, name: string): Promise<User> {
    const isDefaultAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().endsWith('@bookstore.com');
    const role = isDefaultAdmin ? 'admin' : 'user';

    if (!isFirebaseConfigured || !auth) {
      const mockUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
      if (mockUsers.some((u: any) => u.email === email)) {
        throw new Error('Email đã được đăng ký!');
      }

      const mockId = Math.random().toString(36).substring(2, 11);
      const newUser: User = {
        id: mockId,
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };

      mockUsers.push(newUser);
      localStorage.setItem('mock_db_users', JSON.stringify(mockUsers));
      setCurrentUserLocal(newUser);
      return newUser;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };

      await firestoreService.set('users', firebaseUser.uid, newUser);
      setCurrentUserLocal(newUser);
      return newUser;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Lỗi đăng ký tài khoản');
    }
  },

  // Login
  async login(email: string, password: string): Promise<User> {
    if (!isFirebaseConfigured || !auth) {
      const mockUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
      const user = mockUsers.find((u: any) => u.email === email);
      
      if (!user) {
        // Auto create mock user for easy testing
        const name = email.split('@')[0];
        const isDefaultAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().endsWith('@bookstore.com');
        const role = isDefaultAdmin ? 'admin' : 'user';
        const newUser: User = {
          id: Math.random().toString(36).substring(2, 11),
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email,
          role,
          createdAt: new Date().toISOString()
        };
        mockUsers.push(newUser);
        localStorage.setItem('mock_db_users', JSON.stringify(mockUsers));
        setCurrentUserLocal(newUser);
        return newUser;
      }

      setCurrentUserLocal(user);
      return user;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      let userObj = await firestoreService.getById('users', firebaseUser.uid);
      if (!userObj) {
        const isDefaultAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().endsWith('@bookstore.com');
        const role = isDefaultAdmin ? 'admin' : 'user';
        userObj = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role,
          createdAt: new Date().toISOString()
        };
        await firestoreService.set('users', firebaseUser.uid, userObj);
      }
      
      setCurrentUserLocal(userObj as User);
      return userObj as User;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Sai tài khoản hoặc mật khẩu');
    }
  },

  // Google Sign In
  async loginWithGoogle(): Promise<User> {
    if (!isFirebaseConfigured || !auth) {
      const email = 'google_user@gmail.com';
      const mockUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
      let user = mockUsers.find((u: any) => u.email === email);

      if (!user) {
        user = {
          id: Math.random().toString(36).substring(2, 11),
          name: 'Google User',
          email,
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          createdAt: new Date().toISOString()
        };
        mockUsers.push(user);
        localStorage.setItem('mock_db_users', JSON.stringify(mockUsers));
      }

      setCurrentUserLocal(user);
      return user;
    }

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      let userObj = await firestoreService.getById('users', firebaseUser.uid);
      if (!userObj) {
        const isDefaultAdmin = firebaseUser.email?.toLowerCase().includes('admin') || firebaseUser.email?.toLowerCase().endsWith('@bookstore.com');
        const role = isDefaultAdmin ? 'admin' : 'user';
        userObj = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email || '',
          role,
          avatar: firebaseUser.photoURL || undefined,
          createdAt: new Date().toISOString()
        };
        await firestoreService.set('users', firebaseUser.uid, userObj);
      }
      
      setCurrentUserLocal(userObj as User);
      return userObj as User;
    } catch (error: any) {
      console.error('Google Sign In failed:', error);
      throw new Error(error.message || 'Lỗi đăng nhập Google');
    }
  },

  // Logout
  async logout(): Promise<void> {
    setCurrentUserLocal(null);

    if (!isFirebaseConfigured || !auth) {
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Get current user synchronously from local storage (useful for routing)
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('auth_current_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
