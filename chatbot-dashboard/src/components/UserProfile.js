import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography } from '@mui/material';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`/api/user/${userId}`).then(response => setUser(response.data));
  }, [userId]);

  if (!user) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{user.name}</Typography>
        <Typography>Email: {user.email}</Typography>
        <Typography>Mobile: {user.mobile}</Typography>
      </CardContent>
    </Card>
  );
}

export default UserProfile;
