import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { saveAs } from 'file-saver';

function ConversationView({ userId }) {
  const [conversations, setConversations] = useState([]);
  const [tags, setTags] = useState({});
  const [exportFormat, setExportFormat] = useState('json');

  useEffect(() => {
    if (userId) {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? `https://chat.awscertif.site/api/conversations/${userId}`
          : `http://127.0.0.1:8000/api/conversations/${userId}`;

      axios
        .get(apiUrl)
        .then((response) => {
          const data = response.data;
          const transformedConversations = Array.isArray(data)
            ? data.map((item) => ({
                userMessage: item.user_message || item[1],
                botResponse: item.bot_response || item[0],
              }))
            : [];
          setConversations(transformedConversations);
        })
        .catch((error) => console.error('Error fetching conversations:', error));
    }
  }, [userId]);

  const handleTagChange = (index, newTag) => {
    setTags((prevTags) => ({
      ...prevTags,
      [index]: newTag,
    }));
  };

  const handleExport = () => {
    const formattedData = conversations.map((conversation, index) => ({
      ...conversation,
      tag: tags[index] || 'Untagged',
    }));

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(formattedData, null, 2)], { type: 'application/json' });
      saveAs(blob, `conversations_user_${userId}.json`);
    } else if (exportFormat === 'csv') {
      const csvContent = [
        'User Message,Bot Response,Tag',
        ...formattedData.map(
          (conv) =>
            `"${conv.userMessage.replace(/"/g, '""')}","${conv.botResponse.replace(/"/g, '""')}","${
              conv.tag
            }"`
        ),
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      saveAs(blob, `conversations_user_${userId}.csv`);
    }
  };

  return (
    <div>
      <Typography variant="h5" color="primary" gutterBottom>
        Conversation History for User ID: {userId}
      </Typography>
      <Paper style={{ maxHeight: 500, overflowY: 'auto', padding: 16, backgroundColor: '#fafafa' }}>
        <List>
          {conversations.length > 0 ? (
            conversations.map((conversation, index) => (
              <ListItem
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: 8,
                }}
              >
                <Box
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#e3f2fd',
                    padding: '8px 16px',
                    borderRadius: 12,
                    maxWidth: '80%',
                  }}
                >
                  <ListItemText primary={`User: ${conversation.userMessage}`} />
                </Box>
                <Box
                  style={{
                    alignSelf: 'flex-end',
                    backgroundColor: '#f1f8e9',
                    padding: '8px 16px',
                    borderRadius: 12,
                    maxWidth: '80%',
                    marginTop: 4,
                  }}
                >
                  <ListItemText primary={`Bot: ${conversation.botResponse}`} />
                </Box>
                <FormControl style={{ marginTop: 8, width: '100%' }}>
                  {/* <InputLabel>Tag</InputLabel> */}
                  <Select
                    value={tags[index] || ''}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="Positive">Positive</MenuItem>
                    <MenuItem value="Negative">Negative</MenuItem>
                    <MenuItem value="Neutral">Neutral</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary" align="center">
              No conversations available.
            </Typography>
          )}
        </List>
      </Paper>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={2}>
        <FormControl style={{ minWidth: 120 }}>
          <InputLabel>Export Format</InputLabel>
          <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="csv">CSV</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleExport}>
          Export Conversations
        </Button>
      </Box>
    </div>
  );
}

export default ConversationView;
