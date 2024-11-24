// EditButton.js
import React from 'react';
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit } from "react-icons/md";

const EditButton = ({ onClick }) => {
  return (
    <Tooltip title="Edit Ingredient" arrow>
      <IconButton color="primary" sx={{ marginLeft: 1 }} onClick={onClick}>
        <MdEdit />
      </IconButton>
    </Tooltip>
  );
};

export default EditButton;