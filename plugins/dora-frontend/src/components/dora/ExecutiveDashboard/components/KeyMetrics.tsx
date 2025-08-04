import { makeStyles } from '@material-ui/core/styles';
import { Typography, Box } from '@material-ui/core';

const useStyles = makeStyles({
    container: {
        padding: '1rem',
    },
});

export const KeyMetrics = () => {
    const classes = useStyles();

    return (
        <Box className={classes.container}>
            <Typography>Key Metrics Component</Typography>
        </Box>
    );
}; 