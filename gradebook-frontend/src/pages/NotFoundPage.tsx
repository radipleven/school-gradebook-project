import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box mt={8} textAlign="center">
      <Typography variant="h4" color="error" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>Go to Dashboard</Button>
    </Box>
  );
};

export default NotFoundPage; 