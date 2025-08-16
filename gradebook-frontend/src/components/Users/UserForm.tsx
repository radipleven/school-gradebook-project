import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { User } from '../../api/users';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { first_name: string; last_name: string; email: string; role: string; password?: string }) => void;
  initialData?: Partial<User>;
}

const roles = ['admin', 'director', 'teacher', 'parent', 'student'];

const UserForm: React.FC<UserFormProps> = ({ open, onClose, onSubmit, initialData }) => {
  const [firstName, setFirstName] = useState(initialData?.first_name || '');
  const [lastName, setLastName] = useState(initialData?.last_name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [role, setRole] = useState(initialData?.role || 'student');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setFirstName(initialData?.first_name || '');
    setLastName(initialData?.last_name || '');
    setEmail(initialData?.email || '');
    setRole(initialData?.role || 'student');
    setPassword('');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName && email && role && (initialData ? true : password)) {
      onSubmit({ first_name: firstName, last_name: lastName, email, role, ...(password ? { password } : {}) });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Edit User' : 'Add User'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            select
            label="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            {roles.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required={!initialData}
            helperText={initialData ? 'Leave blank to keep current password' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm; 