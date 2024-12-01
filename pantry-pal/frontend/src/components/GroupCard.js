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
import SearchIcon from '@mui/icons-material/Search'; // Search icon
import DeleteIcon from '@mui/icons-material/Delete'; // Delete icon
import GroupRecipeSuggestion from './GroupRecipeSuggestion'; // Import GroupRecipeSuggestion component

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
  const [showRecipeSuggestions, setShowRecipeSuggestions] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [groupRecipes, setGroupRecipes] = useState([]);

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

  const fetchGroupRecipes = async () => {
    try {
      const response = await fetch(`${domain}/api/groups/${group.groupId}/recipes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group recipes');
      }

      const data = await response.json();
      setGroupRecipes(Array.isArray(data.recipes) ? data.recipes : []);
    } catch (error) {
      console.error('Error fetching group recipes:', error);
      setSnackbarMessage('Failed to fetch group recipes');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchGroupRecipes();

    // Short polling to update group recipes every 10 seconds
    const intervalId = setInterval(fetchGroupRecipes, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [group.groupId]);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await fetch(`${domain}/api/groups/${group.groupId}/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      const deletedRecipe = await response.json();
      setGroupRecipes((prev) => prev.filter((recipe) => recipe.recipeId !== recipeId));
      setSnackbarMessage('Recipe deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setSnackbarMessage('Failed to delete recipe');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

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

  const handleSearchRecipes = async () => {
    if (showRecipeSuggestions) {
      setShowRecipeSuggestions(false);
      return;
    }
  
    try {
      const response = await fetch(`${domain}/api/groups/${group.groupId}/search-most-matching?limit=10&page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('idToken')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
  
      const data = await response.json();
      console.log("recuoe search", data);
      setRecipes(data || []);
      setShowRecipeSuggestions(true);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setSnackbarMessage('Failed to fetch recipes');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Paper elevation={3} sx={{ marginBottom: 2, padding: 2, borderRadius: '8px' }}>
      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <ListItemText primary={group.groupName} primaryTypographyProps={{ fontWeight: 'bold', fontSize: '1.2rem' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
            {createdGroups.some((createdGroup) => createdGroup.groupId === group.groupId) && (
              <StarIcon sx={{ color: PURPLE, marginRight: 1 }} />
            )}
            <IconButton
              sx={{
                color: PURPLE,
                '&:hover': {
                  backgroundColor: 'rgba(126, 145, 255, 0.1)',
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
                  '&:hover': {
                    backgroundColor: 'rgba(126, 145, 255, 0.1)',
                  },
                }}
                onClick={() => handleGroupSelect(group.groupId)}
              >
                <PersonAddIcon />
              </IconButton>
            )}
            <IconButton
              sx={{
                color: PURPLE,
                '&:hover': {
                  backgroundColor: 'rgba(126, 145, 255, 0.1)',
                },
              }}
              onClick={handleSearchRecipes}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
        <Box 
  sx={{ 
    marginTop: 4, 
    maxWidth: 800, 
    margin: '0 auto', 
    padding: 3, 
    borderRadius: 2, 
    backgroundColor: '#f9f9f9', 
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' 
  }}
>
  <Typography 
    variant="h5" 
    sx={{ 
      fontWeight: 'bold', 
      color: PURPLE, 
      textAlign: 'center', 
      marginBottom: 3 
    }}
  >
    Our Recipes
  </Typography>
  <List>
    {groupRecipes.map((recipe) => (
      <Accordion 
        key={recipe.recipeId} 
        sx={{ 
          marginBottom: 2, 
          borderRadius: 2, 
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', 
          overflow: 'hidden' 
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />} 
          sx={{ 
            backgroundColor: LIGHT_PURPLE, 
            padding: '12px 16px' 
          }}
        >
          <Typography 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: '1.2rem', 
              color: PURPLE 
            }}
          >
            {recipe.recipeName}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '16px' }}>
          <Typography 
            variant="body1" 
            color="textPrimary" 
            sx={{ marginBottom: 2 }}
          >
            <strong>Ingredients:</strong> {recipe.ingredients.join(', ')}
          </Typography>
          <Typography 
            variant="body1" 
            color="textPrimary" 
            sx={{ marginBottom: 2 }}
          >
            <strong>Instructions:</strong>
          </Typography>
          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
            {recipe.instructions.map((instruction, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>
                {instruction.step}
              </li>
            ))}
          </ul>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              marginTop: 2 
            }}
          >
            <IconButton
              sx={{ 
                color: '#d32f2f', 
                '&:hover': { color: '#ff5252' } 
              }}
              onClick={() => handleDeleteRecipe(recipe.recipeId)}
              aria-label="Delete recipe"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </AccordionDetails>
      </Accordion>
    ))}
  </List>
</Box>
        <Divider sx={{ marginY: 2 }} />
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
            <GroupIcon sx={{ color: PURPLE, marginRight: 1 }} />
            <Typography variant="body2" sx={{ color: PURPLE, fontWeight: 'bold' }}>
              Members:
            </Typography>
          </Box>
          <List>
            {groupMembers.map((member) => (
              <Accordion key={member.uid} onChange={() => fetchMemberIngredients(member.uid)} sx={{ marginBottom: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: LIGHT_PURPLE }}>
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
                    <Typography
                      sx={{
                        '&:hover': {
                          color: PURPLE,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        },
                      }}
                    >
                      {member.email}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
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
        {selectedGroupId === group.groupId && (
          <Box sx={{ marginTop: 2, width: '100%' }}>
            <Typography variant="h6" sx={{ color: PURPLE, fontWeight: 'bold', marginBottom: 2 }}>
              Invite Member to Group
            </Typography>
            {warning && (
              <Alert severity="warning" sx={{ marginBottom: 2 }}>
                {warning}
              </Alert>
            )}
            <TextField
              label="Member Email"
              variant="outlined"
              fullWidth
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleInviteMember}
                sx={{
                  backgroundColor: PURPLE,
                  '&:hover': {
                    backgroundColor: PURPLE,
                  },
                }}
              >
                Invite
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleCancelInvite}
                sx={{
                  color: PURPLE,
                  '&:hover': {
                    backgroundColor: 'rgba(126, 145, 255, 0.1)',
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </ListItem>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Leave Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {createdGroups.some((createdGroup) => createdGroup.groupId === group.groupId)
              ? 'You are the creator of this group. Leaving will delete the entire group. Are you sure you want to proceed?'
              : 'Are you sure you want to leave this group?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: PURPLE, '&:hover': { backgroundColor: LIGHT_PURPLE } }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmLeave} sx={{ color: PURPLE, '&:hover': { backgroundColor: LIGHT_PURPLE } }} autoFocus>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

 


      {showRecipeSuggestions && (
  <Box sx={{ marginTop: 4 }}>
    <GroupRecipeSuggestion groupId={group.groupId} recipes={recipes} />
  </Box>
)}
    </Paper>
  );
};

export default GroupCard;