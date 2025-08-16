import api from './index';

export interface AvgGrade {
  student_id: string;
  avg_grade: number;
}

export interface AbsenceCount {
  student_id: string;
  absence_count: number;
}

export const getAvgGrades = async (): Promise<AvgGrade[]> => {
  const res = await api.get('/stats/avg_grade');
  return res.data;
};

export const getAbsenceCounts = async (): Promise<AbsenceCount[]> => {
  const res = await api.get('/stats/absence_count');
  return res.data;
}; 