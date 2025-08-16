import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import * as statsApi from '../api/stats';
import * as studentApi from '../api/students';
import * as userApi from '../api/users';
import api from '../api';
import StatsView from '../components/Stats/StatsView';

const StatsPage: React.FC = () => {
  const { role, userId } = useAuth();
  const [avgGrades, setAvgGrades] = useState<statsApi.AvgGrade[]>([]);
  const [absenceCounts, setAbsenceCounts] = useState<statsApi.AbsenceCount[]>([]);
  const [students, setStudents] = useState<studentApi.Student[]>([]);
  const [users, setUsers] = useState<userApi.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all required data
      let grades = await statsApi.getAvgGrades();
      let absences = await statsApi.getAbsenceCounts();
      const studentsData = await studentApi.getStudents();
      setStudents(studentsData);
      
      // Only fetch users if admin or director (for fallback names)
      if (role === 'admin' || role === 'director') {
        try {
          const usersData = await userApi.getUsers();
          setUsers(usersData);
        } catch (err) {
          console.error('Failed to load users:', err);
          setUsers([]);
        }
      }

      if (role === 'parent') {
        const links = await api.get(`/parent_students/${userId}`);
        const childIds = links.data.map((l: any) => l.student_id);
        grades = grades.filter(g => childIds.includes(g.student_id));
        absences = absences.filter(a => childIds.includes(a.student_id));
      } else if (role === 'student') {
        // Find the student record for this user
        const studentRecord = studentsData.find(s => s.user_id === userId);
        if (studentRecord) {
          grades = grades.filter(g => g.student_id === studentRecord.id);
          absences = absences.filter(a => a.student_id === studentRecord.id);
        }
      }
      setAvgGrades(grades);
      setAbsenceCounts(absences);
    } catch (err: any) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [role, userId]);

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>Statistics</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <StatsView avgGrades={avgGrades} absenceCounts={absenceCounts} students={students} users={users} />
      )}
    </Box>
  );
};

export default StatsPage; 