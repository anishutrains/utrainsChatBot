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
  Pagination,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import ConversationView from './ConversationView';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays } from 'date-fns';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(null); // For filtering by date
  const [page, setPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [date]); // Fetch users when the date changes

  const fetchUsers = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api/users';

    const params = {};
    if (date) {
      // Send the day before to the API
      //const adjustedDate = subDays(date, 1);
      params.date = format(date, 'yyyy-MM-dd'); // Format date as yyyy-MM-dd
    }

    setLoading(true);
    setError(null);

    axios
      .get(apiUrl, { params })
      .then((response) => {
        setUsers(response.data);
        setFilteredUsers(response.data); // Default filtered users to all retrieved users
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users. Please try again later.');
        setLoading(false);
      });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * usersPerPage,
    page * usersPerPage
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={2}>
        {/* User List Section */}
        <Grid item xs={4}>
          <Paper elevation={3} style={{ padding: 16 }}>
            <Typography variant="h5" gutterBottom>
              User List
            </Typography>

            {/* Date Picker for filtering */}
            <DatePicker
              label="Filter by Date"
              value={date}
              onChange={(newValue) => {
                setDate(newValue);
                setPage(1); // Reset to the first page when the date changes
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />

            {error && (
              <Alert severity="error" style={{ marginTop: 16 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {filteredUsers.length === 0 ? (
                  <Typography style={{ marginTop: 16 }}>
                    No users found for the selected date.
                  </Typography>
                ) : (
                  <>
                    <List>
                      {paginatedUsers.map((user, index) => (
                        <ListItem
                          button
                          key={index}
                          onClick={() => setSelectedUserId(user.user_id)}
                          selected={selectedUserId === user.user_id}
                        >
                          <ListItemText
                            primary={`User ID: ${user.user_id}`}
                            secondary={`Date: ${user.created_at}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Pagination
                      count={Math.ceil(filteredUsers.length / usersPerPage)}
                      page={page}
                      onChange={handlePageChange}
                      style={{ marginTop: 16 }}
                    />
                  </>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* User Details Section */}
        {/* Right Section: Conversation View */}
      <Grid item xs={8} style={{ padding: 16 }}>
        <Paper elevation={3} style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
          {selectedUserId ? (
            <ConversationView userId={selectedUserId} />
          ) : (
            <Typography variant="h6" color="textSecondary" align="center">
              Select a user to view conversations.
            </Typography>
          )}
        </Paper>
      </Grid>



      </Grid>
    </LocalizationProvider>
  );
}

export default Dashboard;
