import { IconButton, Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Close } from "@mui/icons-material";
import * as React from "react";

export default function TourComponent(props) {
    const content = props.steps[props.currentStep].content;
    return (
      <Paper sx={{ p: 4, display: "flex", flexDirection: "row", justifyContent:'space-between' }}>
        <Typography>{content}</Typography>
        <Box>
          <IconButton onClick={() => props.setIsOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </Paper>
    );
  }