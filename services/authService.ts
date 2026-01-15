// import { User } from "../types";

// // Mock database of college credentials
// const MOCK_USERS: Record<string, User & { password: string }> = {
//   'harvard': {
//     id: 'usr_harvard_01',
//     email: 'admin@harvard.edu',
//     password: 'password', // In a real app, never store plain text
//     name: 'James Wilson',
//     collegeName: 'Harvard University',
//     logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/2560px-Harvard_University_logo.svg.png'
//   },
//   'mit': {
//     id: 'usr_mit_01',
//     email: 'staff@mit.edu',
//     password: 'password',
//     name: 'Sarah Chen',
//     collegeName: 'Massachusetts Institute of Technology',
//     logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/2560px-MIT_logo.svg.png'
//   },
//   'stanford': {
//     id: 'usr_stanford_01',
//     email: 'rep@stanford.edu',
//     password: 'password',
//     name: 'Michael Ross',
//     collegeName: 'Stanford University',
//     logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Stanford_University_seal_2003.svg/2048px-Stanford_University_seal_2003.svg.png'
//   }
// };

// export const login = async (email: string, password: string): Promise<User> => {
//   // Simulate network delay
//   await new Promise(resolve => setTimeout(resolve, 800));

//   const userEntry = Object.values(MOCK_USERS).find(
//     u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
//   );

//   if (!userEntry) {
//     throw new Error('Invalid credentials');
//   }

//   // Return user without password
//   const { password: _, ...user } = userEntry;
//   return user;
// };

// export const getMockUsersHint = () => {
//     return Object.values(MOCK_USERS).map(u => ({ email: u.email, college: u.collegeName }));
// };

// frontend/src/services/authService.ts
const API_BASE_URL = 'http://localhost:5000';

export interface User {
  _id: string;
  email: string;
  name: string;
  collegeName: string;
  role: 'student' | 'teacher' | 'admin';
  studentId?: string;
  department?: string;
  logoUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
  error?: string; // Add this optional error property
  details?: string; // Add details field too
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  collegeName: string;
  role: 'student' | 'teacher' | 'admin';
  studentId?: string;
  department?: string;
  logoUrl?: string;
}

// Token management
const storeToken = (token: string): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authTimestamp', Date.now().toString());
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const removeToken = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authTimestamp');
};

// Main login function (replaces your mock login)
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token
    storeToken(data.data.token);
    
    return data.data.user;
  } catch (error: any) {
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

// Register function
export const register = async (userData: RegisterData): Promise<{ user: User; token: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data: LoginResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Registration failed');
    }

    // Store token
    storeToken(data.data.token);
    
    return {
      user: data.data.user,
      token: data.data.token
    };
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Get current user profile
export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken();
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    removeToken();
    return null;
  }
};

// Logout
export const logout = (): void => {
  removeToken();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  // Optional: Check token expiry
  const timestamp = localStorage.getItem('authTimestamp');
  if (timestamp) {
    const hoursPassed = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
    if (hoursPassed > 168) { // 7 days
      removeToken();
      return false;
    }
  }

  return true;
};

// Get auth headers for API calls
export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Demo credentials helper (for your hint section)
export const getMockUsersHint = () => {
  return [
    { 
      email: 'admin@harvard.edu', 
      password: 'password123', 
      college: 'Harvard University',
      role: 'admin',
      hint: 'Administrator account'
    },
    { 
      email: 'teacher@mit.edu', 
      password: 'password123', 
      college: 'MIT',
      role: 'teacher',
      hint: 'Teacher account with full access'
    },
    { 
      email: 'student@stanford.edu', 
      password: 'password123', 
      college: 'Stanford University',
      role: 'student',
      hint: 'Student account for testing'
    }
  ];
};

// Seed demo users (run once to populate database)
export const seedDemoUsers = async (): Promise<void> => {
  const demoUsers = [
    {
      email: 'admin@harvard.edu',
      password: 'password123',
      name: 'James Wilson',
      collegeName: 'Harvard University',
      role: 'admin' as const,
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/2560px-Harvard_University_logo.svg.png'
    },
    {
      email: 'teacher@mit.edu',
      password: 'password123',
      name: 'Sarah Chen',
      collegeName: 'Massachusetts Institute of Technology',
      role: 'teacher' as const,
      department: 'Computer Science',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/2560px-MIT_logo.svg.png'
    },
    {
      email: 'student@stanford.edu',
      password: 'password123',
      name: 'Michael Ross',
      collegeName: 'Stanford University',
      role: 'student' as const,
      studentId: 'STU2024001',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Stanford_University_seal_2003.svg/2048px-Stanford_University_seal_2003.svg.png'
    }
  ];

  console.log('Seeding demo users...');
  
  for (const user of demoUsers) {
    try {
      await register(user);
      console.log(`✅ Registered: ${user.email}`);
    } catch (error: any) {
      console.log(`⚠️  ${user.email}: ${error.message}`);
    }
  }
  
  console.log('Demo users seeding completed!');
};