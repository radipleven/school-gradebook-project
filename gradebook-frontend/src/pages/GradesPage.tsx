import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import * as gradeApi from '../api/grades';
import * as studentApi from '../api/students';
import * as userApi from '../api/users';
import GradeList from '../components/Grades/GradeList';
import GradeForm from '../components/Grades/GradeForm';
import { canAddGrades, canEditGrades, canDeleteGrades } from '../utils/rbac';
import api from '../api';

const GradesPage: React.FC = () => {
  const { role, userId } = useAuth();
  const [grades, setGrades] = useState<gradeApi.Grade[]>([]);
  const [students, setStudents] = useState<studentApi.Student[]>([]);
  const [teachers, setTeachers] = useState<userApi.User[]>([]);
  const [users, setUsers] = useState<userApi.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editGrade, setEditGrade] = useState<gradeApi.Grade | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await gradeApi.getGrades();
      if (role === 'parent') {
        // Fetch children for parent
        const links = await api.get(`/parent_students/${userId}`);
        const childIds = links.data.map((l: any) => l.student_id);
        data = data.filter(g => childIds.includes(g.student_id));
      } else if (role === 'student') {
        // Find the student record for this user
        const studentRecord = students.find(s => s.user_id === userId);
        if (studentRecord) {
          data = data.filter(g => g.student_id === studentRecord.id);
        }
      }
      setGrades(data);
    } catch (err: any) {
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentApi.getStudents();
      setStudents(data);
    } catch (err: any) {
      console.error('Failed to load students:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      // Admins and directors can fetch all users to get teachers
      if (role === 'admin' || role === 'director') {
        const data = await userApi.getUsers();
        setTeachers(data);
      } else {
        setTeachers([]);
      }
    } catch (err: any) {
      console.error('Failed to load teachers:', err);
      setTeachers([]);
    }
  };

  const fetchUsers = async () => {
    try {
      // Admins and directors can fetch all users
      if (role === 'admin' || role === 'director') {
        const data = await userApi.getUsers();
        setUsers(data);
      } else {
        // For non-admins, we'll build user info from students and other available data
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchTeachers();
    fetchUsers();
    // eslint-disable-next-line
  }, [role, userId]);

  const handleAdd = () => {
    setEditGrade(null);
    setFormOpen(true);
  };

  const handleEdit = (grade: gradeApi.Grade) => {
    setEditGrade(grade);
    setFormOpen(true);
  };

  const handleDelete = async (grade: gradeApi.Grade) => {
    if (!window.confirm('Delete this grade?')) return;
    setActionLoading(true);
    try {
      await gradeApi.deleteGrade(grade.id);
      await fetchGrades();
    } catch {
      setError('Failed to delete grade');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: { student_id: string; subject: string; value: number; teacher_id: string }) => {
    setActionLoading(true);
    try {
      if (editGrade) {
        await gradeApi.updateGrade(editGrade.id, data);
      } else {
        await gradeApi.createGrade(data);
      }
      setFormOpen(false);
      await fetchGrades();
    } catch {
      setError('Failed to save grade');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>Grades</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Stack direction="row" mb={2}>
            {canAddGrades(role) && (
              <Button variant="contained" color="primary" onClick={handleAdd} disabled={actionLoading}>
                Add Grade
              </Button>
            )}
          </Stack>
          <GradeList
            grades={grades}
            role={role}
            onEdit={canEditGrades(role) ? handleEdit : undefined}
            onDelete={canDeleteGrades(role) ? handleDelete : undefined}
            users={users}
            students={students}
          />
          <GradeForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editGrade || undefined}
            students={students}
            teachers={teachers}
            users={users}
            currentUserRole={role}
            currentUserId={userId}
          />
        </>
      )}
    </Box>
  );
};

export default GradesPage; 