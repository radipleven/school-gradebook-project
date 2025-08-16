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
import { Absence } from '../../api/absences';
import { User } from '../../api/users';
import { Student } from '../../api/students';
import { getStudentName } from '../../utils/studentNames';

interface AbsenceListProps {
  absences: Absence[];
  role: string | null;
  onEdit?: (absence: Absence) => void;
  onDelete?: (absence: Absence) => void;
  users?: User[];
  students?: Student[];
}

const AbsenceList: React.FC<AbsenceListProps> = ({ absences, role, onEdit, onDelete, users = [], students = [] }) => {
  const canEdit = ["admin", "director", "teacher"].includes(role || '');

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Absence ID</TableCell>
              {canEdit && (onEdit || onDelete) && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {absences.map((absence) => (
              <TableRow key={absence.id}>
                <TableCell>{getStudentName(absence.student_id, students, users)}</TableCell>
                <TableCell>{absence.date}</TableCell>
                <TableCell>{absence.reason}</TableCell>
                <TableCell>{absence.id}</TableCell>
                {canEdit && (onEdit || onDelete) && (
                  <TableCell>
                    {onEdit && (
                      <IconButton onClick={() => onEdit(absence)} size="small">
                        <EditIcon />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton onClick={() => onDelete(absence)} size="small" color="error">
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

export default AbsenceList; 