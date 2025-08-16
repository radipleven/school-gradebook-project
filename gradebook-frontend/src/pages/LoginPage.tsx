import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';
import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/login', { email, password });
      login(res.data.user_id, res.data.role);
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Typography variant="h4" align="center" gutterBottom>Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <LoginForm onLogin={handleLogin} loading={loading} />
      </Box>
    </Container>
  );
};

export default LoginPage; 