import React, { useState } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { User } from '../../api/users';
import { Student } from '../../api/students';

interface ParentStudentLinkFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { parent_id: string; student_id: string }) => void;
  parents: User[];
  students: Student[];
  users: User[];
}

const ParentStudentLinkForm: React.FC<ParentStudentLinkFormProps> = ({ open, onClose, onSubmit, parents, students, users }) => {
  const [parentId, setParentId] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentId && studentId) {
      onSubmit({ parent_id: parentId, student_id: studentId });
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : userId;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Parent-Student Link</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            select
            label="Parent"
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            {parents.filter(parent => parent.role === 'parent').map(parent => (
              <MenuItem key={parent.id} value={parent.id}>
                {parent.first_name} {parent.last_name} ({parent.email})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Student"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            {students.map(student => (
              <MenuItem key={student.id} value={student.id}>
                {getUserName(student.user_id)} - Class {student.class}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Add Link</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ParentStudentLinkForm; 