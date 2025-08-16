import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { AvgGrade, AbsenceCount } from '../../api/stats';
import { Student } from '../../api/students';
import { User } from '../../api/users';
import { getStudentName } from '../../utils/studentNames';

interface StatsViewProps {
  avgGrades: AvgGrade[];
  absenceCounts: AbsenceCount[];
  students?: Student[];
  users?: User[];
}

const StatsView: React.FC<StatsViewProps> = ({ avgGrades, absenceCounts, students = [], users = [] }) => (
  <Box>
    <Typography variant="h6" gutterBottom>Average Grades</Typography>
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Student Name</TableCell>
            <TableCell>Average Grade</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {avgGrades.map(row => (
            <TableRow key={row.student_id}>
              <TableCell>{getStudentName(row.student_id, students, users)}</TableCell>
              <TableCell>{row.avg_grade?.toFixed(2) || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Typography variant="h6" gutterBottom>Absence Counts</Typography>
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Student Name</TableCell>
            <TableCell>Absence Count</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {absenceCounts.map(row => (
            <TableRow key={row.student_id}>
              <TableCell>{getStudentName(row.student_id, students, users)}</TableCell>
              <TableCell>{row.absence_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default StatsView; 