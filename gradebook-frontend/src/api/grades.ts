import api from './index';

export interface Grade {
  id: string;
  student_id: string;
  subject: string;
  value: number;
  teacher_id: string;
  created_at: string;
}

export const getGrades = async (): Promise<Grade[]> => {
  const res = await api.get('/grades');
  return res.data;
};

export const createGrade = async (grade: Omit<Grade, 'id' | 'created_at'>) => {
  const res = await api.post('/grades', grade);
  return res.data;
};

export const updateGrade = async (id: string, grade: Partial<Omit<Grade, 'id' | 'created_at'>>) => {
  const res = await api.put(`/grades/${id}`, grade);
  return res.data;
};

export const deleteGrade = async (id: string) => {
  const res = await api.delete(`/grades/${id}`);
  return res.data;
}; 