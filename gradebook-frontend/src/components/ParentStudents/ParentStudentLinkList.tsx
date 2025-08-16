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
import DeleteIcon from '@mui/icons-material/Delete';
import { ParentStudentLink } from '../../api/parentStudents';
import { User } from '../../api/users';
import { Student } from '../../api/students';
import { getStudentName } from '../../utils/studentNames';

interface ParentStudentLinkListProps {
  links: ParentStudentLink[];
  onDelete?: (link: ParentStudentLink) => void;
  users?: User[];
  students?: Student[];
}

const ParentStudentLinkList: React.FC<ParentStudentLinkListProps> = ({ links, onDelete, users = [], students = [] }) => {
  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : `Parent ID: ${userId}`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Parent Name</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Link ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>{getUserName(link.parent_id)}</TableCell>
                <TableCell>{getStudentName(link.student_id, students, users)}</TableCell>
                <TableCell>{link.id}</TableCell>
                <TableCell>
                  {onDelete && (
                    <IconButton onClick={() => onDelete(link)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParentStudentLinkList; 