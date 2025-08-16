import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'You have full access to all system features including user management, statistics, and all school data.';
      case 'director':
        return 'You can manage students, grades, absences, and view statistics for your school.';
      case 'teacher':
        return 'You can manage grades and absences for your students, and view student information.';
      case 'parent':
        return 'You can view grades, absences, and information for your children.';
      case 'student':
        return 'You can view your own grades, absences, and academic information.';
      default:
        return 'Welcome to the school gradebook system.';
    }
  };

  const getAvailableFeatures = (role: string) => {
    const features = {
      admin: ['User Management', 'Parent-Student Links', 'All Students', 'All Grades', 'All Absences', 'System Statistics'],
      director: ['Students Management', 'Grades Management', 'Absences Management', 'School Statistics'],
      teacher: ['Students View', 'Grades Management', 'Absences Management', 'Class Statistics'],
      parent: ['Children\'s Grades', 'Children\'s Absences', 'Children\'s Statistics'],
      student: ['My Grades', 'My Absences', 'My Statistics']
    };
    return features[role as keyof typeof features] || [];
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>
        Welcome to School Gradebook
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Role: <Chip label={role?.toUpperCase()} color="primary" />
              </Typography>
              <Typography variant="body1" paragraph>
                {getRoleDescription(role || '')}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Available Features:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getAvailableFeatures(role || '').map((feature, index) => (
                  <Chip key={index} label={feature} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Navigation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the navigation bar above to access different sections of the system based on your role permissions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage; 