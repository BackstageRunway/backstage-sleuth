import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography, Box } from '@material-ui/core';
import { useState } from 'react';
import { Alert } from '@material-ui/lab';
import { TimeRange } from '../common/types/metrics';

import { TeamPerformance } from './components/TeamPerformance';
import { TeamSelector } from './components/TeamSelector';
import { TimeRangeSelector } from '../shared/components/TimeRangeSelector';
import { useAllTeamsMetrics } from './hooks/useAllTeamsMetrics';
import { useUserTeams } from '../common/hooks/useUserTeams';


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
    content: {
        position: 'relative',
    },
    error: {
        marginBottom: '1rem',
    },
});

export const LeadDashboard = () => {
    const classes = useStyles();
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null); // null means "All Teams"
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last7days');

    // Get user's teams from Backstage catalog
    const { teams: userTeams, loading: userTeamsLoading, error: userTeamsError } = useUserTeams();

    // Get teams data (all teams or single team based on selection)
    const { teams: allTeamsData, loading: allTeamsLoading, error: allTeamsError } = useAllTeamsMetrics(
        userTeams || [],
        selectedTimeRange
    );

    // Determine which loading and error states to use
    // If a specific team is selected, we only care about the teams data loading
    // If no team is selected, we care about both user teams and all teams data loading
    const isLoading = selectedTeam ? allTeamsLoading : (userTeamsLoading || allTeamsLoading);
    
    // Build error message
    let errorMessage = null;
    if (userTeamsError) {
        errorMessage = `Failed to load user teams: ${userTeamsError}`;
    } else if (allTeamsError) {
        errorMessage = `Failed to load team metrics: ${allTeamsError}`;
    } else if (userTeams && userTeams.length === 0) {
        errorMessage = 'No teams found for your user account. Please check your entity relations.';
    }

    return (
        <div className={classes.container}>
            <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box flex={1} />
                    <TimeRangeSelector 
                        selectedRange={selectedTimeRange}
                        onRangeChange={setSelectedTimeRange}
                    />
                    <Box flex={1} display="flex" justifyContent="flex-end">
                        <TeamSelector 
                            selectedTeam={selectedTeam}
                            onTeamChange={setSelectedTeam}
                        />
                    </Box>
                </Box>
            </Box>

            {errorMessage && (
                <Alert severity="error" className={classes.error}>
                    {errorMessage}
                </Alert>
            )}
            
            <div className={classes.content}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <Typography className={classes.title}>Team Performance</Typography>
                            <TeamPerformance 
                                selectedTeam={selectedTeam} 
                                allTeamsData={allTeamsData}
                                isLoading={isLoading}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}; 