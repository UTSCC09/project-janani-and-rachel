// EditButton.js
import React from 'react';
import { IconButton, Tooltip } from "@mui/material";
import { MdEdit } from "react-icons/md";

const EditButton = ({ onClick }) => {
  return (
    <Tooltip title="Edit Ingredient" arrow>
      <IconButton  sx={{ marginLeft: 1, color: "ffffff"}} onClick={onClick}>
        <MdEdit />
      </IconButton>
    </Tooltip>
  );
};

export default EditButton;