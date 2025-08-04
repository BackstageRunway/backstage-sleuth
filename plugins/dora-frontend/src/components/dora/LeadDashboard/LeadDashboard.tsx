import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography, Box, CircularProgress } from '@material-ui/core';
import { useState } from 'react';
import { Alert } from '@material-ui/lab';

import { TeamPerformance } from './components/TeamPerformance';
import { TeamSelector } from './components/TeamSelector';
import { TimeRangeSelector } from '../shared/components/TimeRangeSelector';
import { useTeamMetrics } from './hooks/useTeamMetrics';
import { useAllTeamsMetrics } from '../common/hooks/useAllTeamsMetrics';
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
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'last7days' | 'last14days' | 'last28days' | 'last90days'>('last7days');

    // Get user's teams from Backstage catalog
    const { teams: userTeams, loading: userTeamsLoading, error: userTeamsError } = useUserTeams();

    // Get all teams for the overview (using batch API)
    const { teams: allTeamsData, loading: allTeamsLoading, error: allTeamsError } = useAllTeamsMetrics(
        userTeams, // Use teams from useUserTeams hook
        selectedTimeRange
    );

    // Use custom hook for individual team metrics data fetching and state
    const {
        loading: individualTeamLoading,
        error: individualTeamError,
    } = useTeamMetrics(selectedTeam);

    // Determine which loading and error states to use
    const isLoading = userTeamsLoading || allTeamsLoading || individualTeamLoading;
    const hasError = userTeamsError || allTeamsError || individualTeamError;

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

            {hasError && (
                <Alert severity="error" className={classes.error}>
                    {hasError}
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