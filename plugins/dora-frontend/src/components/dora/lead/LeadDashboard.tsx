import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography, Box } from '@material-ui/core';
import { useState } from 'react';

import { TeamPerformance } from './components/TeamPerformance';
import { TeamSelector } from './components/TeamSelector';


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
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    return (
        <div className={classes.container}>
            <Box mb={3}>
                <Typography variant="h4" className={classes.title}>
                    Lead Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    View team performance metrics for teams you belong to
                </Typography>
                <TeamSelector 
                    selectedTeam={selectedTeam}
                    onTeamChange={setSelectedTeam}
                />
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Team Performance</Typography>
                        <TeamPerformance selectedTeam={selectedTeam} />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}; 