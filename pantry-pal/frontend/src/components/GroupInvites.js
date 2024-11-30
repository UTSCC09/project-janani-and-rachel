import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

const GroupInvites = ({ groupInvites }) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: YELLOW }}>
        <Typography variant="h6" sx={{ color: PURPLE, fontWeight: 'bold' }}>
        Group Invites
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {groupInvites.map((invite) => (
            <ListItem key={invite.id} sx={{ borderBottom: `1px solid ${PURPLE}`, borderRadius: '8px', marginBottom: '8px' }}>
              <ListItemText primary={invite.name} />
              <IconButton
                sx={{
                  color: PURPLE,
                  '&:hover': {
                    color: PURPLE,
                  },
                }}
                onClick={() => {/* Accept invite logic */}}
              >
                <CheckCircleIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: PURPLE,
                  '&:hover': {
                    color: PURPLE,
                  },
                }}
                onClick={() => {/* Decline invite logic */}}
              >
                <CancelIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default GroupInvites;