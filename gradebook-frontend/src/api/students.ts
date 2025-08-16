import api from './index';

export interface Student {
  id: string;
  user_id: string;
  class: string;
  created_at: string;
  // User information fields (when joined from backend)
  first_name?: string;
  last_name?: string;
  email?: string;
}

export const getStudents = async (): Promise<Student[]> => {
  const res = await api.get('/students');
  return res.data;
};

export const getStudent = async (id: string): Promise<Student> => {
  const res = await api.get(`/students/${id}`);
  return res.data;
};

export const createStudent = async (student: Omit<Student, 'id' | 'created_at'>) => {
  const res = await api.post('/students', student);
  return res.data;
};

export const updateStudent = async (id: string, student: Partial<Omit<Student, 'id' | 'created_at'>>) => {
  const res = await api.put(`/students/${id}`, student);
  return res.data;
};

export const deleteStudent = async (id: string) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
}; 