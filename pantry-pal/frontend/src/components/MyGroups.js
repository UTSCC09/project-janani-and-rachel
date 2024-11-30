import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CreateGroup from './CreateGroup'; // Import CreateGroup component
import GroupCard from './GroupCard'; // Import GroupCard component

const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const MyGroups = () => {
  const [myGroups, setMyGroups] = useState([]);
  const [createdGroups, setCreatedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [inviteResponse, setInviteResponse] = useState(null);
  const [warning, setWarning] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${domain}/api/groups`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
            'GoogleAccessToken': localStorage.getItem('accessToken'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }

        const data = await response.json();
        // console.log("my groups", data.groups);
        setMyGroups(data.groups);
      } catch (error) {
        // console.error('Error fetching groups:', error);
        setSnackbarMessage('Failed to fetch groups');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    const fetchCreatedGroups = async () => {
      try {
        const response = await fetch(`${domain}/api/groups/created-by-me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
            'GoogleAccessToken': localStorage.getItem('accessToken'),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch created groups');
        }

        const data = await response.json();
        setCreatedGroups(data.groups);
      } catch (error) {
        console.error('Error fetching created groups:', error);
        setSnackbarMessage('Failed to fetch created groups');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    fetchGroups();
    fetchCreatedGroups();

    // Short polling to update groups every 10 seconds
    const intervalId = setInterval(() => {
      fetchGroups();
      fetchCreatedGroups();
    }, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleInvite = async () => {
    if (!selectedGroupId) {
      setWarning('Please select a group to invite the member to.');
      return;
    }

    try {
      const response = await fetch(`${domain}/api/groups/${selectedGroupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
          'GoogleAccessToken': localStorage.getItem('accessToken'),
        },
        body: JSON.stringify({ memberEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message === 'User is already invited to join this group.') {
          setSnackbarMessage('User is already invited to join this group.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        } else {
          console.error('Error inviting member:', errorData.message || 'Unknown error');
          setSnackbarMessage('Failed to invite member');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } else {
        const data = await response.json();
        setInviteResponse(data);
        setMemberEmail(''); // Clear the input field
        setWarning(''); // Clear the warning message
        setSnackbarMessage('Member invited successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true); // Show the snackbar
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      setSnackbarMessage('Failed to invite member');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
    setWarning(''); // Clear the warning message
  };

  const handleCancelInvite = () => {
    setSelectedGroupId(null); // Hide the invite form
    setMemberEmail(''); // Clear the input field
    setWarning(''); // Clear the warning message
  };

  const handleLeaveGroup = async (groupId, isCreator) => {
    try {
      const response = await fetch(`${domain}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
          'GoogleAccessToken': localStorage.getItem('accessToken'),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to leave group');
      }

      setMyGroups((prevGroups) => prevGroups.filter((group) => group.groupId !== groupId));
      if (isCreator) {
        setCreatedGroups((prevGroups) => prevGroups.filter((group) => group.groupId !== groupId));
      }

      setSnackbarMessage(isCreator ? 'Group deleted successfully!' : 'Left group successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true); // Show the snackbar
    } catch (error) {
      console.error('Error leaving group:', error);
      setSnackbarMessage('Failed to leave group');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Hide the snackbar
  };

  return (
    <>
      <CreateGroup
        onGroupCreated={(newGroup) => {
          setMyGroups((prevGroups) => [...prevGroups, newGroup]);
          setCreatedGroups((prevGroups) => [...prevGroups, newGroup]);
        }}
      />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: YELLOW }}>
          <Typography variant="h6" sx={{ color: PURPLE, fontWeight: 'bold' }}>
            My Groups
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {myGroups.map((group) => (
              <GroupCard
                key={group.groupId}
                group={group}
                createdGroups={createdGroups}
                selectedGroupId={selectedGroupId}
                memberEmail={memberEmail}
                warning={warning}
                setWarning={setWarning}
                handleGroupSelect={handleGroupSelect}
                handleInvite={handleInvite}
                handleCancelInvite={handleCancelInvite}
                setMemberEmail={setMemberEmail}
                handleLeaveGroup={handleLeaveGroup}
              />
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MyGroups;