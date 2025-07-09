import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, Link, FormHelperText } from '@mui/material';
import { loginUser } from '../services/api';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, darkMode }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ usernameOrEmail: false, password: false });
  const [loading, setLoading] = useState(false);

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
      (window as any).getUserId = () => result.userId;
      setLoading(false);
      onClose();
      window.location.reload(); // Optionally reload to update UI
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.3rem', bgcolor: darkMode ? 'grey.900' : 'grey.100' }}>
        Login
      </DialogTitle>
      <DialogContent sx={{ bgcolor: darkMode ? 'grey.900' : 'grey.100', pb: 1 }}>
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
            size="small"
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
            size="small"
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link href="/register" underline="hover" color={darkMode ? 'primary.light' : 'primary.main'}>
              Register here
            </Link>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: darkMode ? 'grey.900' : 'grey.100', pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="text" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleLogin} color="primary" variant="contained" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginModal; 