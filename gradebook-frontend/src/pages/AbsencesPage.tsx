import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import * as absenceApi from '../api/absences';
import * as studentApi from '../api/students';
import * as userApi from '../api/users';
import AbsenceList from '../components/Absences/AbsenceList';
import AbsenceForm from '../components/Absences/AbsenceForm';
import { canAddAbsences, canEditAbsences, canDeleteAbsences } from '../utils/rbac';
import api from '../api';

const AbsencesPage: React.FC = () => {
  const { role, userId } = useAuth();
  const [absences, setAbsences] = useState<absenceApi.Absence[]>([]);
  const [students, setStudents] = useState<studentApi.Student[]>([]);
  const [users, setUsers] = useState<userApi.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editAbsence, setEditAbsence] = useState<absenceApi.Absence | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAbsences = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await absenceApi.getAbsences();
      if (role === 'parent') {
        // Fetch children for parent
        const links = await api.get(`/parent_students/${userId}`);
        const childIds = links.data.map((l: any) => l.student_id);
        data = data.filter(a => childIds.includes(a.student_id));
      } else if (role === 'student') {
        // Find the student record for this user
        const studentRecord = students.find(s => s.user_id === userId);
        if (studentRecord) {
          data = data.filter(a => a.student_id === studentRecord.id);
        }
      }
      setAbsences(data);
    } catch (err: any) {
      setError('Failed to load absences');
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
    fetchAbsences();
    fetchStudents();
    fetchUsers();
    // eslint-disable-next-line
  }, [role, userId]);

  const handleAdd = () => {
    setEditAbsence(null);
    setFormOpen(true);
  };

  const handleEdit = (absence: absenceApi.Absence) => {
    setEditAbsence(absence);
    setFormOpen(true);
  };

  const handleDelete = async (absence: absenceApi.Absence) => {
    if (!window.confirm('Delete this absence?')) return;
    setActionLoading(true);
    try {
      await absenceApi.deleteAbsence(absence.id);
      await fetchAbsences();
    } catch {
      setError('Failed to delete absence');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: { student_id: string; date: string; reason: string }) => {
    setActionLoading(true);
    try {
      if (editAbsence) {
        await absenceApi.updateAbsence(editAbsence.id, data);
      } else {
        await absenceApi.createAbsence(data);
      }
      setFormOpen(false);
      await fetchAbsences();
    } catch {
      setError('Failed to save absence');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>Absences</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Stack direction="row" mb={2}>
            {canAddAbsences(role) && (
              <Button variant="contained" color="primary" onClick={handleAdd} disabled={actionLoading}>
                Add Absence
              </Button>
            )}
          </Stack>
          <AbsenceList
            absences={absences}
            role={role}
            onEdit={canEditAbsences(role) ? handleEdit : undefined}
            onDelete={canDeleteAbsences(role) ? handleDelete : undefined}
            users={users}
            students={students}
          />
          <AbsenceForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editAbsence || undefined}
            students={students}
            users={users}
          />
        </>
      )}
    </Box>
  );
};

export default AbsencesPage; 