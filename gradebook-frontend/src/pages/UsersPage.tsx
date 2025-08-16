import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material';
import * as userApi from '../api/users';
import UserList from '../components/Users/UserList';
import UserForm from '../components/Users/UserForm';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<userApi.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<userApi.User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: userApi.User) => {
    setEditUser(user);
    setFormOpen(true);
  };

  const handleDelete = async (user: userApi.User) => {
    if (!window.confirm('Delete this user?')) return;
    setActionLoading(true);
    try {
      await userApi.deleteUser(user.id);
      await fetchUsers();
    } catch {
      setError('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data: { first_name: string; last_name: string; email: string; role: string; password?: string }) => {
    setActionLoading(true);
    try {
      if (editUser) {
        await userApi.updateUser(editUser.id, data);
      } else {
        await userApi.createUser(data as any);
      }
      setFormOpen(false);
      await fetchUsers();
    } catch {
      setError('Failed to save user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
          <Stack direction="row" mb={2}>
            <Button variant="contained" color="primary" onClick={handleAdd} disabled={actionLoading}>
              Add User
            </Button>
          </Stack>
          <UserList
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <UserForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editUser || undefined}
          />
        </>
      )}
    </Box>
  );
};

export default UsersPage; 