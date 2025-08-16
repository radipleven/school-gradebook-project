import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navigation: React.FC = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/login') return null;

  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: '/', roles: ['admin', 'director', 'teacher', 'parent', 'student'] },
      { label: 'Users', path: '/users', roles: ['admin'] },
      { label: 'Parent Links', path: '/parent-links', roles: ['admin'] },
    ];

    // Conditional label for Students/My Info
    const studentsItem = {
      label: role === 'student' ? 'My Info' : role === 'parent' ? 'My Children' : 'Students',
      path: '/students',
      roles: ['admin', 'director', 'teacher', 'parent', 'student']
    };

    const otherItems = [
      { label: role === 'student' ? 'My Grades' : 'Grades', path: '/grades', roles: ['admin', 'director', 'teacher', 'parent', 'student'] },
      { label: role === 'student' ? 'My Absences' : 'Absences', path: '/absences', roles: ['admin', 'director', 'teacher', 'parent', 'student'] },
      { label: 'Statistics', path: '/stats', roles: ['admin', 'director', 'teacher', 'parent', 'student'] },
    ];

    return [...baseItems, studentsItem, ...otherItems];
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          School Gradebook
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {getNavItems()
            .filter(item => role && item.roles.includes(role))
            .map(item => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                variant={location.pathname === item.path ? 'outlined' : 'text'}
              >
                {item.label}
              </Button>
            ))}
          <Button color="inherit" onClick={logout} variant="outlined">
            Logout ({role})
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;