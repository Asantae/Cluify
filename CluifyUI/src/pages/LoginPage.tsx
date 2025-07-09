import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Paper, FormHelperText, CircularProgress, Avatar } from '@mui/material';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import cluifyIcon from '../assets/cluify_investigator_icon.png';

interface LoginPageProps {
  darkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ darkMode }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ usernameOrEmail: false, password: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!usernameOrEmail.trim()) return 'Username or email is required.';
    if (!password) return 'Password is required.';
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ usernameOrEmail: true, password: true });
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await loginUser(usernameOrEmail, password);
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('username', result.username);
      if (result.token) localStorage.setItem('token', result.token);
      (window as any).getUserId = () => result.userId;
      setLoading(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? 'linear-gradient(135deg, #232526 0%, #414345 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={6} sx={{ p: 4, maxWidth: 420, width: '100%', bgcolor: darkMode ? 'grey.850' : 'white', borderRadius: 4, boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={cluifyIcon} alt="Cluify" sx={{ width: 64, height: 64, mb: 2, bgcolor: 'transparent' }} />
        <Typography variant="h4" align="center" fontWeight={700} mb={1} color={darkMode ? 'primary.light' : 'primary.main'}>
          Login
        </Typography>
        <Typography variant="body2" align="center" mb={2} color={darkMode ? 'grey.400' : 'grey.700'}>
          Welcome back! Sign in to continue your investigation.
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <TextField
            label="Username or Email"
            value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, usernameOrEmail: true }))}
            error={touched.usernameOrEmail && !usernameOrEmail.trim()}
            fullWidth
            autoFocus
            autoComplete="username"
            variant="outlined"
            size="medium"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, password: true }))}
            error={touched.password && !password}
            fullWidth
            autoComplete="current-password"
            variant="outlined"
            size="medium"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1, py: 1.2, fontWeight: 600, fontSize: '1.1rem', borderRadius: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link href="/register" underline="hover" color={darkMode ? 'primary.light' : 'primary.main'}>
              Register here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage; 