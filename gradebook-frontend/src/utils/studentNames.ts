import { Student } from '../api/students';
import { User } from '../api/users';

// Cache for student user information
const studentUserCache = new Map<string, { first_name: string; last_name: string; email: string }>();

export const getStudentName = (
  studentId: string, 
  students: Student[], 
  users: User[]
): string => {
  // First find the student record
  const student = students?.find(s => s.id === studentId);
  if (!student) return `Student ID: ${studentId}`;
  
  // If student has name info directly (from joined query), use it
  if (student.first_name && student.last_name) {
    return `${student.first_name} ${student.last_name}`;
  }
  
  // Check cache first
  const cached = studentUserCache.get(student.user_id);
  if (cached) {
    return `${cached.first_name} ${cached.last_name}`;
  }
  
  // Then find the user for that student (fallback for admin users)
  const user = users?.find(u => u.id === student.user_id);
  if (user) {
    // Cache the user info
    studentUserCache.set(student.user_id, {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    });
    return `${user.first_name} ${user.last_name}`;
  }
  
  // If no user found (non-admin case), show class info if available
  return `Student in Class ${student.class}`;
};

export const getTeacherName = (teacherId: string, users: User[]): string => {
  const user = users?.find(u => u.id === teacherId);
  return user ? `${user.first_name} ${user.last_name}` : `Teacher ID: ${teacherId}`;
};

export const clearStudentNameCache = () => {
  studentUserCache.clear();
};