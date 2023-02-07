import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import "./theme.css";

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#A5C9CA",
      dark: "#2C3333",
    },
    secondary: {
      main: "#395B64",
    },
    error: {
      main: red.A400,
    },
    text: {
      primary: "#f9f9f9",
      secondary: "#9f9f9f",
    },
  },
});

export default theme;
