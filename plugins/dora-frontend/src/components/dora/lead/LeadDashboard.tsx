import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography } from '@material-ui/core';

import { TeamPerformance } from './components/TeamPerformance';


const useStyles = makeStyles({
    container: {
        padding: '1rem',
    },
    paper: {
        padding: '1rem',
        marginBottom: '1rem',
    },
    title: {
        marginBottom: '1rem',
        fontSize: '1.25rem',
        fontWeight: 500,
    },
});

export const LeadDashboard = () => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <Grid container spacing={3}>

                 <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Team Performance</Typography>
                        <TeamPerformance />
                    </Paper>
                </Grid>

               

            </Grid>
        </div>
    );
}; 