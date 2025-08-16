import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Stack, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import * as studentApi from '../api/students';
import * as userApi from '../api/users';
import * as parentStudentApi from '../api/parentStudents';
import StudentList from '../components/Students/StudentList';
import StudentForm from '../components/Students/StudentForm';
import { canAddStudents, canEditStudents, canDeleteStudents } from '../utils/rbac';

const StudentsPage: React.FC = () => {
  const { role, userId } = useAuth();
  const [students, setStudents] = useState<studentApi.Student[]>([]);
  const [users, setUsers] = useState<userApi.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<studentApi.Student | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await studentApi.getStudents();
      if (role === 'parent') {
        // Fetch children for parent
        const links = await (await import('../api')).default.get(`/parent_students/${userId}`);
        const childIds = links.data.map((l: any) => l.student_id);
        data = data.filter(s => childIds.includes(s.id));
      } else if (role === 'student') {
        // Students can only see their own record
        data = data.filter(s => s.user_id === userId);
      }
      setStudents(data);
    } catch (err: any) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    // Only fetch users if the role has permission (admin or director)
    if (role === 'admin' || role === 'director') {
      try {
        const data = await userApi.getUsers();
        setUsers(data);
      } catch (err: any) {
        console.error('Failed to load users:', err);
      }
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchUsers();
    // eslint-disable-next-line
  }, [role, userId]);

  const handleAdd = () => {
    setEditStudent(null);
    setFormOpen(true);
  };

  const handleEdit = (student: studentApi.Student) => {
    setEditStudent(student);
    setFormOpen(true);
  };

  const handleDelete = async (student: studentApi.Student) => {
    if (!window.confirm('Delete this student?')) return;
    setActionLoading(true);
    try {
      await studentApi.deleteStudent(student.id);
      await fetchStudents();
    } catch {
      setError('Failed to delete student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: { first_name: string; last_name: string; class: string; parent_id?: string }) => {
    setActionLoading(true);
    try {
      if (editStudent) {
        // For editing, we would need to update the user and student
        // For now, we'll just show an error
        setError('Editing students is not yet implemented');
      } else {
        // Create the user first
        const userData = {
          email: `${data.first_name.toLowerCase()}.${data.last_name.toLowerCase()}@school.com`,
          password: 'password123', // Default password
          role: 'student',
          first_name: data.first_name,
          last_name: data.last_name
        };
        
        const newUser = await userApi.createUser(userData);
        
        // Create the student record
        const studentData = {
          user_id: newUser.id,
          class: data.class
        };
        
        const newStudent = await studentApi.createStudent(studentData);
        
        // If a parent was selected, create the parent-student link
        if (data.parent_id) {
          await parentStudentApi.createParentStudentLink({
            parent_id: data.parent_id,
            student_id: newStudent.id
          });
        }
      }
      setFormOpen(false);
      await fetchStudents();
      await fetchUsers(); // Refresh users list
    } catch (err: any) {
      setError('Failed to save student');
      console.error('Error creating student:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getPageTitle = () => {
    switch (role) {
      case 'student': return 'My Information';
      case 'parent': return 'My Children';
      default: return 'Students';
    }
  };

  const renderStudentInfo = () => {
    if (role === 'student' && students.length === 1) {
      const student = students[0];
      return (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Student Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Name:</strong> {student.first_name && student.last_name 
                    ? `${student.first_name} ${student.last_name}` 
                    : 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Email:</strong> {student.email || 'Not available'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Class:</strong> {student.class}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Student ID:</strong> {student.id}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <StudentList
        students={students}
        role={role}
        onEdit={canEditStudents(role) ? handleEdit : undefined}
        onDelete={canDeleteStudents(role) ? handleDelete : undefined}
        users={users}
      />
    );
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>{getPageTitle()}</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Stack direction="row" mb={2}>
            {canAddStudents(role) && (
              <Button variant="contained" color="primary" onClick={handleAdd} disabled={actionLoading}>
                Add Student
              </Button>
            )}
          </Stack>
          {renderStudentInfo()}
          <StudentForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editStudent || undefined}
            users={users}
          />
        </>
      )}
    </Box>
  );
};

export default StudentsPage; 