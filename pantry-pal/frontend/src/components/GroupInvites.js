import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Accept invite icon
import CancelIcon from "@mui/icons-material/Cancel"; // Decline invite icon

const PURPLE = "#7e91ff";
const YELLOW = "#fffae1";

const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const GroupInvites = () => {
  const [groupInvites, setGroupInvites] = useState([]); // state for storing group invites 
  const [snackbarOpen, setSnackbarOpen] = useState(false); // invite snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // invite snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); //  snackbar severity

  useEffect(() => {
    const fetchGroupInvites = async () => {
      try {
        const response = await fetch(`${domain}/api/groups/invites`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
            GoogleAccessToken: localStorage.getItem("accessToken"),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch group invites");
        }

        // parse and store group invite data
        const data = await response.json();
        setGroupInvites(data.groups);
      } catch (error) {
        console.error("Error fetching group invites:", error);
        setSnackbarMessage("Failed to fetch group invites");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchGroupInvites();

    // Short polling to update group invites every 10 seconds
    const intervalId = setInterval(fetchGroupInvites, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleAcceptInvite = async (groupId) => {
    try {
      const response = await fetch(`${domain}/api/groups/${groupId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to accept invite");
      }

      // remove the accepted invite from the list
      setGroupInvites((prevInvites) =>
        prevInvites.filter((invite) => invite.groupId !== groupId)
      );
      setSnackbarMessage("Invite accepted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      // do nothing
      // i know this might seem crazy but it is for short polling
    }
  };

  const handleDeclineInvite = async (groupId) => {
    try {
      const response = await fetch(`${domain}/api/groups/${groupId}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to decline invite");
      }

      // remove the declined invite from the list
      setGroupInvites((prevInvites) =>
        prevInvites.filter((invite) => invite.groupId !== groupId)
      );
      setSnackbarMessage("Invite declined successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      // do nothing
      // i know this might seem crazy but it is for short polling
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: YELLOW }}
        >
          <Typography variant="h6" sx={{ color: PURPLE, fontWeight: "bold" }}>
            Group Invites
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {groupInvites.map((invite) => (
              <ListItem
                key={invite.groupId}
                sx={{
                  borderBottom: `1px solid ${PURPLE}`,
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <ListItemText
                  primary = {<span dangerouslySetInnerHTML={{__html: invite.groupName}} />}
                  secondary={`Invited by: ${invite.creatorEmail}`}
                />
                <IconButton
                  sx={{
                    color: PURPLE,
                    "&:hover": {
                      color: PURPLE,
                    },
                  }}
                  onClick={() => handleAcceptInvite(invite.groupId)}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: PURPLE,
                    "&:hover": {
                      color: PURPLE,
                    },
                  }}
                  onClick={() => handleDeclineInvite(invite.groupId)}
                >
                  <CancelIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GroupInvites;