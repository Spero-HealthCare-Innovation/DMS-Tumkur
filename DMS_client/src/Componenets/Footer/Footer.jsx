import { Box, Typography } from '@mui/material';
import logo from '../../assets/spero_copy_right.png';

export default function Footer({ darkMode }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        height: '30px',
        width: '100%',
        zIndex: 1000,
        backgroundColor: darkMode ? "#202328" : "#CCDBEF",
        transition: "background-color 0.5s ease-in-out, color 0.5s ease-in-out",
        color: darkMode ? 'white' : 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',  // center horizontally
        px: 2,
        gap: 1,  // gap between text and image
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontFamily: 'sans-serif',
          fontStyle: 'normal',
          textDecoration: 'none',
        }}
      >
        Powered by
      </Typography>

      <Box
        component="img"
        src={logo}
        alt="Logo"
        sx={{
          height: 30,
          width: 50,
        }}
      />
    </Box>
  );
}
