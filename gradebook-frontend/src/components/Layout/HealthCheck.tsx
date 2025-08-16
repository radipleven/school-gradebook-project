import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import api from '../../api';

const HealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/health');
        setHealthStatus('ok');
      } catch (error) {
        setHealthStatus('error');
        setShowAlert(true);
      }
    };

    checkHealth();
  }, []);

  return (
    <Snackbar
      open={showAlert && healthStatus === 'error'}
      autoHideDuration={6000}
      onClose={() => setShowAlert(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="error" onClose={() => setShowAlert(false)}>
        Backend server is not responding. Please check if the server is running on port 3000.
      </Alert>
    </Snackbar>
  );
};

export default HealthCheck;