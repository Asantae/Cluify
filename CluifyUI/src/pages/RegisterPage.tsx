import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Paper, FormHelperText, CircularProgress, Avatar } from '@mui/material';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import cluifyIcon from '../assets/cluify_investigator_icon.png';

interface RegisterPageProps {
  darkMode: boolean;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ darkMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({ username: false, email: false, password: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!username.trim()) return 'Username is required.';
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Valid email is required.';
    if (!password || password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerUser(username, email, password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: darkMode ? 'linear-gradient(135deg, #232526 0%, #414345 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={6} sx={{ p: 4, maxWidth: 420, width: '100%', bgcolor: darkMode ? 'grey.850' : 'white', borderRadius: 4, boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={cluifyIcon} alt="Cluify" sx={{ width: 64, height: 64, mb: 2, bgcolor: 'transparent' }} />
        <Typography variant="h4" align="center" fontWeight={700} mb={1} color={darkMode ? 'primary.light' : 'primary.main'}>
          Create Account
        </Typography>
        <Typography variant="body2" align="center" mb={2} color={darkMode ? 'grey.400' : 'grey.700'}>
          Join Cluify to start solving mysteries!
        </Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, username: true }))}
            error={touched.username && !username.trim()}
            fullWidth
            autoFocus
            autoComplete="username"
            variant="outlined"
            size="medium"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          />
          <TextField
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            error={touched.email && (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))}
            fullWidth
            autoComplete="email"
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
            error={touched.password && (!password || password.length < 6)}
            fullWidth
            autoComplete="new-password"
            variant="outlined"
            size="medium"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
          {success && <FormHelperText sx={{ color: 'success.main' }}>{success}</FormHelperText>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1, py: 1.2, fontWeight: 600, fontSize: '1.1rem', borderRadius: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Register'}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link href="/login" underline="hover" color={darkMode ? 'primary.light' : 'primary.main'}>
              Login here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage; 