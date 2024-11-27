import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationButton = ({ onClick }) => {
  return (
    <Tooltip title="Notify" arrow>
      <IconButton onClick={onClick} sx={{ color: "#fff" }}>
      <NotificationsIcon />
      </IconButton>
    </Tooltip>
  );
};

export default NotificationButton;