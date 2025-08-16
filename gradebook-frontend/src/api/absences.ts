import api from './index';

export interface Absence {
  id: string;
  student_id: string;
  date: string;
  reason: string;
  created_at: string;
}

export const getAbsences = async (): Promise<Absence[]> => {
  const res = await api.get('/absences');
  return res.data;
};

export const createAbsence = async (absence: Omit<Absence, 'id' | 'created_at'>) => {
  const res = await api.post('/absences', absence);
  return res.data;
};

export const updateAbsence = async (id: string, absence: Partial<Omit<Absence, 'id' | 'created_at'>>) => {
  const res = await api.put(`/absences/${id}`, absence);
  return res.data;
};

export const deleteAbsence = async (id: string) => {
  const res = await api.delete(`/absences/${id}`);
  return res.data;
}; 