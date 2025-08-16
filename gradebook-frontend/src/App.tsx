import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navigation from './components/Layout/Navigation';
import HealthCheck from './components/Layout/HealthCheck';
import { Container } from '@mui/material';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <HealthCheck />
      <Navigation />
      <Container maxWidth="lg">
        <AppRoutes />
      </Container>
    </BrowserRouter>
  </AuthProvider>
);

export default App; 