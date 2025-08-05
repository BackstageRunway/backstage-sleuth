import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography } from '@material-ui/core';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { ProjectHealth } from './components/ProjectHealth';
import { useOrganizationTrendMetrics } from './hooks/useOrganizationTrendMetrics';
import { TimeRangeSelector } from '../shared/components/TimeRangeSelector';

import { Alert } from '@material-ui/lab';



const useStyles = makeStyles({
    error: {
        marginBottom: '1rem',
    },
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

export const ExecutiveDashboard = () => {
    const classes = useStyles();
   
    const {
        data,
        loading,
        error,
        selectedTimeRange,
        setSelectedTimeRange
    } = useOrganizationTrendMetrics()
   
    
    // Extract the metrics data from the response
    const metricsData = data?.organization?.metricsRecapWithQuarters;

    if (error) {
        return (
            <div className={classes.container}>
                <Alert severity="error" className={classes.error}>
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <TimeRangeSelector 
                selectedRange={selectedTimeRange}
                onRangeChange={setSelectedTimeRange}
            />
            {loading && <div>Loading organization trend metrics...</div>}
            {error && <div style={{color: 'red'}}>Error: {error}</div>}
         
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Executive Dashboard</Typography>
                         <ExecutiveSummary metricsData={metricsData} />
                    </Paper>
                </Grid>
                
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Quaterly Health</Typography>
                        <ProjectHealth 
                            data={data}
                            loading={loading}
                            error={error}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}; 
