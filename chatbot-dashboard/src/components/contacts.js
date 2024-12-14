import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

function Contact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = () => {
    const apiUrl =
      process.env.NODE_ENV === 'production'
        ? `https://chat.awscertif.site/api/get_user_contacts`
        : `http://127.0.0.1:8000/api/get_user_contacts`;

    setLoading(true);
    setError(null);

    axios
      .get(apiUrl)
      .then((response) => {
        setContacts(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching contacts:', err);
        setError('Failed to fetch contacts. Please try again later.');
        setLoading(false);
      });
  };

  const handleEdit = (contactId) => {
    alert(`Edit contact with ID: ${contactId}`);
    // Implement edit functionality here
  };

  const handleDelete = (contactId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this contact?'
    );
    if (confirmDelete) {
      alert(`Delete contact with ID: ${contactId}`);
      // Implement delete functionality here
    }
  };

  const handleView = (contactId) => {
    alert(`View details for contact ID: ${contactId}`);
    // Implement view functionality here
  };

  return (
    <Grid container spacing={2} style={{ padding: 16 }}>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ padding: 16 }}>
          <Typography variant="h5" gutterBottom>
            Contact List
          </Typography>
          {error && (
            <Alert severity="error" style={{ marginBottom: 16 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {contacts.length === 0 ? (
                <Typography>No contacts found.</Typography>
              ) : (
                contacts.map((contact) => (
                  <ListItem
                    key={contact.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <ListItemText
                      primary={`${contact.mobile_number} (${contact.email})`}
                      secondary={contact.email}
                    />
                    <Box>
                      <Tooltip title="View">
                        <IconButton
                          onClick={() => handleView(contact.id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEdit(contact.id)}
                          color="secondary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(contact.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Contact;
