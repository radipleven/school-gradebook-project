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
import { Grade } from '../../api/grades';
import { User } from '../../api/users';
import { Student } from '../../api/students';
import { getStudentName, getTeacherName } from '../../utils/studentNames';

interface GradeListProps {
  grades: Grade[];
  role: string | null;
  onEdit?: (grade: Grade) => void;
  onDelete?: (grade: Grade) => void;
  users?: User[];
  students?: Student[];
}

const GradeList: React.FC<GradeListProps> = ({ grades, role, onEdit, onDelete, users = [], students = [] }) => {
  const canEdit = ["admin", "director", "teacher"].includes(role || '');

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Teacher Name</TableCell>
              <TableCell>Grade ID</TableCell>
              {canEdit && (onEdit || onDelete) && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>{getStudentName(grade.student_id, students, users)}</TableCell>
                <TableCell>{grade.subject}</TableCell>
                <TableCell>{grade.value}</TableCell>
                <TableCell>{getTeacherName(grade.teacher_id, users)}</TableCell>
                <TableCell>{grade.id}</TableCell>
                {canEdit && (onEdit || onDelete) && (
                  <TableCell>
                    {onEdit && (
                      <IconButton onClick={() => onEdit(grade)} size="small">
                        <EditIcon />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton onClick={() => onDelete(grade)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GradeList; 