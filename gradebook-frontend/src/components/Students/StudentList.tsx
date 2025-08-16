import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Box 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Student } from '../../api/students';
import { User } from '../../api/users';

interface StudentListProps {
  students: Student[];
  role: string | null;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  users?: User[];
}

const StudentList: React.FC<StudentListProps> = ({ students, role, onEdit, onDelete, users = [] }) => {
  const getStudentName = (student: Student) => {
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    // Fallback for cases where user info is not available
    const user = users?.find(u => u.id === student.user_id);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Student ID</TableCell>
              {role === 'admin' && (onEdit || onDelete) && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              return (
                <TableRow key={student.id}>
                  <TableCell>{getStudentName(student)}</TableCell>
                  <TableCell>{student.email || 'N/A'}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.id}</TableCell>
                  {role === 'admin' && (onEdit || onDelete) && (
                    <TableCell>
                      {onEdit && (
                        <IconButton onClick={() => onEdit(student)} size="small">
                          <EditIcon />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton onClick={() => onDelete(student)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentList; 