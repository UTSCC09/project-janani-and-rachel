import React, { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, IconButton, Box, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star'; // Leader icon
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Leave group icon
import GroupIcon from '@mui/icons-material/Group'; // Members icon
import CreateGroup from './CreateGroup'; // Import CreateGroup component

const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const MyGroups = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [createdGroups, setCreatedGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [inviteResponse, setInviteResponse] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${domain}/api/groups`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }

        const data = await response.json();
        setMyGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    const fetchCreatedGroups = async () => {
      try {
        const response = await fetch(`${domain}/api/groups/created-by-me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch created groups');
        }

        const data = await response.json();
        console.log("created groups", data);
        setCreatedGroups(data);
      } catch (error) {
        console.error('Error fetching created groups:', error);
      }
    };

    fetchGroups();
    fetchCreatedGroups();

    // Short polling to update groups every 10 seconds
    const intervalId = setInterval(fetchGroups, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleInvite = async () => {
    if (!selectedGroup) {
      alert('Please select a group to invite the member to.');
      return;
    }

    try {
      const response = await fetch(`${domain}/api/groups/${selectedGroup}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
        },
        body: JSON.stringify({ memberEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite member');
      }

      const data = await response.json();
      setInviteResponse(data);
      setMemberEmail(''); // Clear the input field
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  return (
    <>
      <CreateGroup onGroupCreated={(newGroup) => {
        setMyGroups((prevGroups) => [...prevGroups, newGroup]);
        setCreatedGroups((prevGroups) => [...prevGroups, newGroup]);
      }} />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: YELLOW, width: '100%' }}>
          <Typography variant="h6" sx={{ color: PURPLE, fontWeight: 'bold' }}>
            My Groups
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {myGroups.map((group) => (
              <ListItem key={group.groupld} sx={{ borderBottom: `1px solid ${PURPLE}`, flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ListItemText primary={group.groupName} />
                  {createdGroups.some(createdGroup => createdGroup.groupld === group.groupld) && (
                    <StarIcon sx={{ color: PURPLE }} />
                  )}
                  <IconButton
                    sx={{
                      color: PURPLE,
                      '&:hover': {
                        backgroundColor: 'rgba(126, 145, 255, 0.1)', // Adjust the hover background color if needed
                      },
                    }}
                    onClick={() => {/* Leave group logic */}}
                  >
                    <ExitToAppIcon />
                  </IconButton>
                </Box>
                <Box sx={{ marginTop: 1, marginBottom: 1, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon sx={{ color: PURPLE, marginRight: 1 }} />
                    <Typography variant="body2" sx={{ color: PURPLE }}>
                      Members:
                    </Typography>
                  </Box>
                  <List>
                    {group.groupMembers && group.groupMembers.map((member, index) => (
                      <ListItem key={index} sx={{ paddingLeft: 0 }}>
                        <ListItemText primary={member} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {createdGroups.length > 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6" sx={{ color: PURPLE, fontWeight: 'bold', marginBottom: 2 }}>
            Invite Member to Group
          </Typography>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="select-group-label">Select Group</InputLabel>
            <Select
              labelId="select-group-label"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              label="Select Group"
            >
              {createdGroups.map((group) => (
                <MenuItem key={group.groupld} value={group.groupld}>
                  {group.groupName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Member Email"
            variant="outlined"
            fullWidth
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleInvite}
            sx={{
              backgroundColor: PURPLE,
              '&:hover': {
                backgroundColor: PURPLE,
              },
            }}
          >
            Invite
          </Button>
          {inviteResponse && (
            <Typography variant="body2" sx={{ color: PURPLE, marginTop: 2 }}>
              Member invited successfully!
            </Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default MyGroups;