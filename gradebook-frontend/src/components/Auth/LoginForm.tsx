import React, { useState } from 'react';
import { Button, TextField, Box, CircularProgress } from '@mui/material';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
        error={touched && !email}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        required
        error={touched && !password}
      />
      <Box mt={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Box>
    </form>
  );
};

export default LoginForm; 