import React from 'react';
import { Box, Typography, Chip, Icon } from '@mui/material';
import { styled } from '@mui/material/styles';
import VideoPlayer from './VideoPlayer';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const PlayerContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
}));

const VideoContainer = styled(Box)({
  position: 'relative',
});

const TopOverlay = styled(Box)({
  position: 'absolute',
  top: 8,
  left: 8,
  right: 8,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  zIndex: 1,
});

const BottomControls = styled(Box)({
    padding: '12px 16px',
});

const StatusChip = styled(Chip)(({ theme }) => ({
    height: '24px',
    borderRadius: '6px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    '& .MuiChip-label': {
        display: 'flex',
        alignItems: 'center',
    },
    '& .MuiChip-icon': {
        color: 'inherit',
        marginLeft: '8px',
        marginRight: '-4px',
    }
}));

const PlayerWrapper = React.forwardRef(({ url, isLeader, onTimeUpdate, syncTime }, ref) => {
    const cameraName = `Camera:${url.slice(url.lastIndexOf('/') + 1)}`;
    const streamName = url.split('/').slice(-2).join('/');

  return (
    <PlayerContainer>
        <VideoContainer>
            <TopOverlay>
                <Box display="flex" flexDirection="column" alignItems="flex-start">
                    <Icon component={SignalCellularAltIcon} sx={{ color: '#A062FF', mb: 1 }} />
                    <Chip 
                        icon={<FiberManualRecordIcon sx={{ fontSize: 14, color: 'red' }} />}
                        label="WEBRTC LIVE" 
                        size="small" 
                        sx={{ backgroundColor: 'rgba(255, 0, 0, 0.7)', color: 'white', fontWeight: 'bold' }} 
                    />
                </Box>
                <Chip label="1920x1080" size="small" sx={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }} icon={<SignalCellularAltIcon sx={{ transform: 'rotate(90deg)', color: 'white', fontSize: 16 }} />} />
            </TopOverlay>

            <VideoPlayer
                ref={ref}
                src={url}
                isLeader={isLeader}
                onTimeUpdate={onTimeUpdate}
                syncTime={syncTime}
            />
        </VideoContainer>
        <BottomControls>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" gap={1}>
                    <StatusChip icon={<SettingsInputComponentIcon />} label="AI" />
                    <StatusChip 
                        icon={<FiberManualRecordIcon sx={{ fontSize: 14, color: '#00E676' }} />}
                        label="Online"
                    />
                </Box>
                <StatusChip 
                    icon={<FiberManualRecordIcon sx={{ fontSize: 14, color: '#00E676' }} />}
                    label="WebRTC"
                />
            </Box>
            <Typography variant="body1" fontWeight="bold">Live PPE - {cameraName}</Typography>
            <Typography variant="caption" color="text.secondary">{streamName}</Typography>
            <Typography variant="body2" sx={{ color: '#A062FF' }} fontWeight="bold">Main Camera (P1)</Typography>
        </BottomControls>
    </PlayerContainer>
  );
});

export default PlayerWrapper;
