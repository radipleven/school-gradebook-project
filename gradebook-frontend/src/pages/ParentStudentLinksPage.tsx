import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material';
import * as parentStudentApi from '../api/parentStudents';
import * as userApi from '../api/users';
import * as studentApi from '../api/students';
import ParentStudentLinkList from '../components/ParentStudents/ParentStudentLinkList';
import ParentStudentLinkForm from '../components/ParentStudents/ParentStudentLinkForm';

const ParentStudentLinksPage: React.FC = () => {
  const [links, setLinks] = useState<parentStudentApi.ParentStudentLink[]>([]);
  const [parents, setParents] = useState<userApi.User[]>([]);
  const [students, setStudents] = useState<studentApi.Student[]>([]);
  const [users, setUsers] = useState<userApi.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the new function to get all parent-student links
      const data = await parentStudentApi.getAllParentStudentLinks();
      setLinks(data);
    } catch (err: any) {
      setError('Failed to load parent-student links');
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const data = await userApi.getUsers();
      setParents(data);
    } catch (err: any) {
      console.error('Failed to load parents:', err);
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
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    fetchLinks();
    fetchParents();
    fetchStudents();
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setFormOpen(true);
  };

  const handleDelete = async (link: parentStudentApi.ParentStudentLink) => {
    if (!window.confirm('Delete this parent-student link?')) return;
    setActionLoading(true);
    try {
      await parentStudentApi.deleteParentStudentLink(link);
      await fetchLinks();
    } catch {
      setError('Failed to delete link');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: { parent_id: string; student_id: string }) => {
    setActionLoading(true);
    try {
      await parentStudentApi.createParentStudentLink(data);
      setFormOpen(false);
      await fetchLinks();
    } catch {
      setError('Failed to create link');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>Parent-Student Links</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Stack direction="row" mb={2}>
            <Button variant="contained" color="primary" onClick={handleAdd} disabled={actionLoading}>
              Add Link
            </Button>
          </Stack>
          <ParentStudentLinkList
            links={links}
            onDelete={handleDelete}
            users={users}
            students={students}
          />
          <ParentStudentLinkForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleFormSubmit}
            parents={parents}
            students={students}
            users={users}
          />
        </>
      )}
    </Box>
  );
};

export default ParentStudentLinksPage; 