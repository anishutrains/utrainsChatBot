import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Facebook, Twitter, LinkedIn } from '@mui/icons-material';

function Footer() {
  return (
    <Box
      component="footer"
      style={{
        backgroundColor: '#1976d2',
        color: '#fff',
        padding: '16px 0',
        marginTop: 'auto',
      }}
    >
      <Typography align="center" variant="body1">
        &copy; {new Date().getFullYear()} utrains. All Rights Reserved.
      </Typography>
      <Box textAlign="center" mt={1}>
        <IconButton color="inherit">
          <Facebook />
        </IconButton>
        <IconButton color="inherit">
          <Twitter />
        </IconButton>
        <IconButton color="inherit">
          <LinkedIn />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Footer;
