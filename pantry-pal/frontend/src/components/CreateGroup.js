import React, { useState } from "react";
import { Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

const PURPLE = "#7e91ff";
const domain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;

const CreateGroup = ({ onGroupCreated }) => {
  const [newGroupName, setNewGroupName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${domain}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          GoogleAccessToken: localStorage.getItem("accessToken"),
        },
        body: JSON.stringify({ groupName: newGroupName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const data = await response.json();
      onGroupCreated(data); // Update the groups state in MyGroups.js
      setSnackbarOpen(true); // Show success message
      setNewGroupName(""); // Clear the input field
      setShowForm(false); // Hide the form
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Failed to create group");
    }
  };

  const handleCancel = () => {
    setNewGroupName(""); // Reset the group name
    setShowForm(false); // Hide the form
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ textAlign: "center", marginBottom: 4 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<GroupAddIcon />}
        onClick={() => setShowForm((prev) => !prev)}
        sx={{
          backgroundColor: PURPLE,
          "&:hover": {
            backgroundColor: PURPLE,
          },
        }}
      >
        {showForm ? "Cancel" : "Create New Group"}
      </Button>

      {showForm && (
        <Box component="form" onSubmit={handleSubmit} sx={{ marginTop: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: PURPLE,
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: PURPLE,
                },
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={handleCancel}
              sx={{
                color: PURPLE,
                "&:hover": {
                  backgroundColor: "rgba(126, 145, 255, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: PURPLE,
                "&:hover": {
                  backgroundColor: PURPLE,
                },
              }}
            >
              Create Group
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Group created successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default CreateGroup;