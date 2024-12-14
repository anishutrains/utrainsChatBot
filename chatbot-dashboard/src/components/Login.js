import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Default credentials
  const defaultUserId = 'admin';
  const defaultPassword = 'password';

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === defaultUserId && password === defaultPassword) {
      setError(null);
      onLoginSuccess(); // Update authentication status
      navigate('/'); // Redirect to the dashboard
    } else {
      setError('Invalid User ID or Password');
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: '100vh', backgroundColor: '#f4f4f4' }}
    >
      <Grid item xs={10} sm={6} md={4}>
        <Paper elevation={3} style={{ padding: 32 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="User ID"
              variant="outlined"
              fullWidth
              margin="normal"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Alert severity="error" style={{ margin: '16px 0' }}>
                {error}
              </Alert>
            )}
            <Box textAlign="center" marginTop={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Login
              </Button>
            </Box>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Login;
