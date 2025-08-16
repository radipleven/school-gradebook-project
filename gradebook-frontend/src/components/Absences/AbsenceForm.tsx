import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { Absence } from '../../api/absences';
import { Student } from '../../api/students';
import { User } from '../../api/users';

interface AbsenceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { student_id: string; date: string; reason: string }) => void;
  initialData?: Partial<Absence>;
  students: Student[];
  users: User[];
}

const AbsenceForm: React.FC<AbsenceFormProps> = ({ open, onClose, onSubmit, initialData, students, users }) => {
  const [studentId, setStudentId] = useState(initialData?.student_id || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [reason, setReason] = useState(initialData?.reason || '');

  useEffect(() => {
    setStudentId(initialData?.student_id || '');
    setDate(initialData?.date || '');
    setReason(initialData?.reason || '');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId && date && reason) {
      onSubmit({ student_id: studentId, date, reason });
    }
  };

  const getStudentName = (student: Student) => {
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    // Fallback for cases where user info is not available
    const user = users.find(u => u.id === student.user_id);
    return user ? `${user.first_name} ${user.last_name}` : student.user_id;
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Edit Absence' : 'Add Absence'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
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
                {getStudentName(student)} - Class {student.class}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            fullWidth
            margin="normal"
            required
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

export default AbsenceForm; 