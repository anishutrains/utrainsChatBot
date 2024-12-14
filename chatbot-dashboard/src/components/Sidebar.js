import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@mui/material';

function Sidebar() {
  return (
    <List>
      <ListItem button component={Link} to="/">
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem button component={Link} to="/contacts">
        <ListItemText primary="Contacts" />
      </ListItem>
      <ListItem button component={Link} to="/settings">
        <ListItemText primary="Settings" />
      </ListItem>
    </List>
  );
}

export default Sidebar;
