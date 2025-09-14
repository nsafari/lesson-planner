export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: 'student' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  studentId?: number; // Optional, only present for student users
  studentInfo?: Student; // Optional, only present for student users
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  message: string;
  username: string;
  imageUrl?: string;
  userType: 'student' | 'admin';
  studentId?: number;
  studentInfo?: Student;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  retryPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}
