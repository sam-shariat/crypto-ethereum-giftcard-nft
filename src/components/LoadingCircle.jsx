import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LoadingCircle(props) {
    return (
      <Box sx={{ mt:10,width:'100%',display: 'inline-flex',position:'relative' , justifyContent:'center',alignItems:'center'}}>
        <CircularProgress 
        disableShrink 
        variant="indeterminate" 
        size={80}
        color="secondary"
        thickness={4} {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body1"
            component="p"
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  export default LoadingCircle;