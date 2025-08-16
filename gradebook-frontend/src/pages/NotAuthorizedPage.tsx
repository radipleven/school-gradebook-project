import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotAuthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box mt={8} textAlign="center">
      <Typography variant="h4" color="error" gutterBottom>
        Not Authorized
      </Typography>
      <Typography variant="body1" gutterBottom>
        You do not have permission to view this page.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>Go to Dashboard</Button>
    </Box>
  );
};

export default NotAuthorizedPage; 