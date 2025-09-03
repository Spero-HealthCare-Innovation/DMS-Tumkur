import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

function MultiScreen({ darkMode }) {
  useEffect(() => {
    document.title = "DMS|System";
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        // bgcolor: darkMode ? '#0a1929' : '#f5f5f5',
        color: darkMode ? 'white' : 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        transition: 'background-color 0.5s ease-in-out, color 0.5s ease-in-out',
        animation: `${fadeIn} 1s ease-out`,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          animation: `${pulse} 2s infinite`,
          textAlign: 'center',
        }}
      >
        System is starting
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            animation: `${bounce} 1s infinite`,
            ml: 1,
          }}
        >
          ...
        </Box>
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mt: 2,
          fontStyle: 'italic',
          opacity: 0.8,
          animation: `${pulse} 3s infinite`,
        }}
      >
        Please wait while the system prepares your workspace
      </Typography>
    </Box>
  );
}

export default MultiScreen;
