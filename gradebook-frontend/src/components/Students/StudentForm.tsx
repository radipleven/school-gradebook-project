import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { Student } from '../../api/students';
import { User } from '../../api/users';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { first_name: string; last_name: string; class: string; parent_id?: string }) => void;
  initialData?: Partial<Student>;
  users: User[];
}

const StudentForm: React.FC<StudentFormProps> = ({ open, onClose, onSubmit, initialData, users }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [className, setClassName] = useState('');
  const [parentId, setParentId] = useState('');

  useEffect(() => {
    if (initialData) {
      // For editing, we would need to fetch the user data
      // For now, we'll just reset the form
      setFirstName('');
      setLastName('');
      setClassName(initialData.class || '');
      setParentId('');
    } else {
      setFirstName('');
      setLastName('');
      setClassName('');
      setParentId('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName && className) {
      onSubmit({ 
        first_name: firstName, 
        last_name: lastName, 
        class: className, 
        parent_id: parentId || undefined 
      });
    }
  };

  // Filter users to only show those with role 'parent'
  const parentUsers = users.filter(user => user.role === 'parent');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Edit Student' : 'Add Student'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            fullWidth
            margin="normal"
            required
            helperText="Enter the student's first name"
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            fullWidth
            margin="normal"
            required
            helperText="Enter the student's last name"
          />
          <TextField
            label="Class"
            value={className}
            onChange={e => setClassName(e.target.value)}
            fullWidth
            margin="normal"
            required
            helperText="Enter the class for this student"
          />
          <TextField
            select
            label="Parent (Optional)"
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Select a parent for this student (optional)"
          >
            <MenuItem value="">
              <em>No parent selected</em>
            </MenuItem>
            {parentUsers.map(user => (
              <MenuItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Update' : 'Add'} Student
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StudentForm; 