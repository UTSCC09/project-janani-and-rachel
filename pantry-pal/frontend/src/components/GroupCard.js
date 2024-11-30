import React, { useState, useEffect } from 'react';
import {
  Paper,
  ListItem,
  Box,
  ListItemText,
  IconButton,
  Typography,
  List,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Snackbar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star'; // Leader icon
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Leave group icon
import GroupIcon from '@mui/icons-material/Group'; // Members icon
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Add member icon

const PURPLE = "#7e91ff";
const LIGHT_PURPLE = "#d1d9ff";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const GroupCard = ({
  group,
  createdGroups,
  selectedGroupId,
  memberEmail,
  warning,
  setWarning,
  handleGroupSelect,
  handleInvite,
  handleCancelInvite,
  setMemberEmail,
  handleLeaveGroup,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [memberIngredients, setMemberIngredients] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (group.pending) {
        setSnackbarMessage('You have not accepted the group request.');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }

      try {
        const response = await fetch(`${domain}/api/groups/${group.groupId}/members`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch group members');
        }

        const data = await response.json();
        setGroupMembers(data);
      } catch (error) {
        console.error('Error fetching group members:', error);
        setSnackbarMessage('Failed to fetch group members');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

    fetchGroupMembers();

    // Short polling to update group members every 10 seconds
    const intervalId = setInterval(fetchGroupMembers, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [group.groupId, group.pending]);

  const fetchMemberIngredients = async (memberId) => {
    try {
      const response = await fetch(`${domain}/api/groups/${group.groupId}/members/${memberId}/pantry`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch member ingredients');
      }

      const data = await response.json();
      console.log(data);
      setMemberIngredients((prev) => ({ ...prev, [memberId]: data.pantry }));
    } catch (error) {
      console.error('Error fetching member ingredients:', error);
      setSnackbarMessage('Failed to fetch member ingredients');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    // Short polling to update member ingredients every 10 seconds
    const intervalId = setInterval(() => {
      groupMembers.forEach((member) => {
        fetchMemberIngredients(member.uid);
      });
    }, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [groupMembers]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmLeave = () => {
    handleLeaveGroup(group.groupId, createdGroups.some((createdGroup) => createdGroup.groupId === group.groupId));
    handleCloseDialog();
  };

  const handleInviteMember = async () => {
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
<Paper
  elevation={3}
  sx={{
    marginBottom: 2,
    padding: 2,
    borderRadius: '8px',
    '&:hover': {
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
    },
  }}
>
  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <ListItemText
        primary={group.groupName}
        primaryTypographyProps={{ fontWeight: 'bold', fontSize: '1.2rem' }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
        {createdGroups.some((createdGroup) => createdGroup.groupId === group.groupId) && (
          <StarIcon
            sx={{
              color: PURPLE,
              marginRight: 1,
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.2)' },
            }}
          />
        )}
        <IconButton
          sx={{
            color: PURPLE,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(126, 145, 255, 0.1)',
              transform: 'scale(1.1)',
              boxShadow: '0px 2px 8px rgba(126, 145, 255, 0.4)',
            },
          }}
          onClick={handleOpenDialog}
        >
          <ExitToAppIcon />
        </IconButton>
        {createdGroups.some((createdGroup) => createdGroup.groupId === group.groupId) && (
          <IconButton
            sx={{
              color: PURPLE,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(126, 145, 255, 0.1)',
                transform: 'scale(1.1)',
                boxShadow: '0px 2px 8px rgba(126, 145, 255, 0.4)',
              },
            }}
            onClick={() => handleGroupSelect(group.groupId)}
          >
            <PersonAddIcon />
          </IconButton>
        )}
      </Box>
    </Box>
    <Divider sx={{ marginY: 2 }} />
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <GroupIcon
          sx={{
            color: PURPLE,
            marginRight: 1,
            transition: 'all 0.3s ease',
            '&:hover': { color: 'rgba(126, 145, 255, 0.8)', transform: 'scale(1.2)' },
          }}
        />
        <Typography variant="body2" sx={{ color: PURPLE, fontWeight: 'bold' }}>
          Members:
        </Typography>
      </Box>
      <List>
        {groupMembers.map((member) => (
          <Accordion
            key={member.uid}
            onChange={() => fetchMemberIngredients(member.uid)}
            sx={{
              marginBottom: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(126, 145, 255, 0.1)',
                boxShadow: '0px 2px 8px rgba(126, 145, 255, 0.4)',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: LIGHT_PURPLE,
                transition: 'background-color 0.3s ease',
                '&:hover': { backgroundColor: 'rgba(126, 145, 255, 0.2)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: PURPLE,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {member.email.charAt(0).toUpperCase()}
                </Box>
                <Typography>{member.email}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="subtitle2"
                sx={{ marginBottom: 1, fontWeight: 'bold' }}
              >
                Pantry Ingredients:
              </Typography>
              {memberIngredients[member.uid]?.length > 0 ? (
                <List sx={{ padding: 0 }}>
                  {memberIngredients[member.uid].map((ingredient, index) => (
                    <ListItem key={index} sx={{ paddingLeft: 0, paddingTop: 0, paddingBottom: 0 }}>
                      <ListItemText
                        primary={ingredient.ingredientName}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No ingredients available
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </List>
    </Box>
  </ListItem>
</Paper>
  );
  
};

export default GroupCard;