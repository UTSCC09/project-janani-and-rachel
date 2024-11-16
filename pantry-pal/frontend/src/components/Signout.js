import { Button } from "@mui/material";

export default function Signout({ onSignout }) {
  const handleSignout = () => {
    // Clear user session or token
    onSignout();
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleSignout}
      sx={{ backgroundColor: "#f44336", "&:hover": { backgroundColor: "#d32f2f" } }}
    >
      Signout
    </Button>
  );
}