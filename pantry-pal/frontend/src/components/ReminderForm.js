import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const PURPLE = "#7e91ff";
const LIGHT_GRAY = "#d3d3d3";

const ReminderForm = ({ open, onClose, onSubmit }) => {
  const [daysInAdvanceDefrost, setDaysInAdvanceDefrost] = useState('');
  const [daysInAdvanceBuy, setDaysInAdvanceBuy] = useState('');

  const handleSubmit = () => {
    const defrostDays = daysInAdvanceDefrost === '' ? 1 : parseInt(daysInAdvanceDefrost, 10);
    const buyDays = daysInAdvanceBuy === '' ? 3 : parseInt(daysInAdvanceBuy, 10);
    onSubmit({ daysInAdvanceDefrost: defrostDays, daysInAdvanceBuy: buyDays });
    onClose();
  };

  const handleDefrostChange = (e) => {
    setDaysInAdvanceDefrost(e.target.value);
  };

  const handleBuyChange = (e) => {
    setDaysInAdvanceBuy(e.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ backgroundColor: PURPLE, color: "#fff" }}>Set Reminders</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Days in Advance to Defrost"
          type="number"
          fullWidth
          value={daysInAdvanceDefrost}
          onChange={handleDefrostChange}
          onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
          inputProps={{ min: 0 }}
          sx={{
            marginBottom: "1rem",
            '& .MuiInput-underline:before': { borderBottomColor: PURPLE },
            '& .MuiInput-underline:after': { borderBottomColor: PURPLE },
            '& .MuiInputLabel-root.Mui-focused': { color: PURPLE },
          }}
        />
        <TextField
          margin="dense"
          label="Days in Advance to Buy"
          type="number"
          fullWidth
          value={daysInAdvanceBuy}
          onChange={handleBuyChange}
          onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
          inputProps={{ min: 0 }}
          sx={{
            '& .MuiInput-underline:before': { borderBottomColor: PURPLE },
            '& .MuiInput-underline:after': { borderBottomColor: PURPLE },
            '& .MuiInputLabel-root.Mui-focused': { color: PURPLE },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: PURPLE,
            '&:hover': {
              backgroundColor: LIGHT_GRAY,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            color: PURPLE,
            '&:hover': {
              backgroundColor: LIGHT_GRAY,
            },
          }}
        >
          Set Reminders
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderForm;