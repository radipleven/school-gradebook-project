import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { Grade } from '../../api/grades';
import { Student } from '../../api/students';
import { User } from '../../api/users';

interface GradeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { student_id: string; subject: string; value: number; teacher_id: string }) => void;
  initialData?: Partial<Grade>;
  students: Student[];
  teachers: User[];
  users: User[];
  currentUserRole?: string;
  currentUserId?: string;
}

const subjects = ['Math', 'English', 'Science', 'History', 'Geography'];

const GradeForm: React.FC<GradeFormProps> = ({ open, onClose, onSubmit, initialData, students, teachers, users, currentUserRole, currentUserId }) => {
  const [studentId, setStudentId] = useState(initialData?.student_id || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [value, setValue] = useState(initialData?.value?.toString() || '');
  const [teacherId, setTeacherId] = useState(initialData?.teacher_id || '');

  useEffect(() => {
    setStudentId(initialData?.student_id || '');
    setSubject(initialData?.subject || '');
    setValue(initialData?.value?.toString() || '');
    
    // If editing, use the existing teacher_id, otherwise auto-set for teachers
    if (initialData?.teacher_id) {
      setTeacherId(initialData.teacher_id);
    } else if (currentUserRole === 'teacher' && currentUserId) {
      setTeacherId(currentUserId);
    } else {
      setTeacherId('');
    }
  }, [initialData, currentUserRole, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId && subject && value && teacherId) {
      onSubmit({ student_id: studentId, subject, value: Number(value), teacher_id: teacherId });
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
      <DialogTitle>{initialData ? 'Edit Grade' : 'Add Grade'}</DialogTitle>
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
            select
            label="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            fullWidth
            margin="normal"
            required
          >
            {subjects.map(subj => (
              <MenuItem key={subj} value={subj}>{subj}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Grade Value"
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 2, max: 6 }}
          />
          {currentUserRole !== 'teacher' && (
            <TextField
              select
              label="Teacher"
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
              fullWidth
              margin="normal"
              required
            >
              {teachers.filter(teacher => teacher.role === 'teacher').map(teacher => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name} ({teacher.email})
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{initialData ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GradeForm; 