import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlayerWrapper from './components/PlayerWrapper';
import { createTheme, ThemeProvider, CssBaseline, Container, Box, Typography, Button, Grid, AppBar, Toolbar, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [streamUrls, setStreamUrls] = useState([]);
  const [leaderTime, setLeaderTime] = useState(0);
  const [mode, setMode] = useState('light');
  const playersRef = useRef([]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  useEffect(() => {
    fetch('/api/streams')
      .then(response => response.json())
      .then(data => setStreamUrls(data.map(item => item.url)))
      .catch(error => console.error('Error fetching streams:', error));
  }, []);

  const addToRefs = useCallback((el) => {
    if (el && !playersRef.current.includes(el)) {
      playersRef.current.push(el);
    }
  }, []);

  const handleLeaderTimeUpdate = useCallback((time) => {
    setLeaderTime(time);
  }, []);

  const handlePlayAll = () => {
    playersRef.current.forEach(player => player && player.play());
  };

  const handlePauseAll = () => {
    playersRef.current.forEach(player => player && player.pause());
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SyncStream Dashboard
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Button variant="contained" color="primary" onClick={handlePlayAll}>
            Play All
          </Button>
          <Button variant="contained" color="secondary" onClick={handlePauseAll}>
            Pause All
          </Button>
        </Box>
        <Grid container spacing={4}>
          {streamUrls.map((url) => (
            <Grid xs={12} sm={6} md={4} lg={3} key={url}>
              <PlayerWrapper
                ref={addToRefs}
                url={url}
                isLeader={url === streamUrls[0]}
                onTimeUpdate={url === streamUrls[0] ? handleLeaderTimeUpdate : null}
                syncTime={leaderTime}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
