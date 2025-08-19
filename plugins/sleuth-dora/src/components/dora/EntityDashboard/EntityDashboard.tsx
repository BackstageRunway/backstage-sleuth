import { useEntity } from '@backstage/plugin-catalog-react';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Grid, Paper } from '@material-ui/core';
import { TimeRangeSelector } from '../shared/components/TimeRangeSelector';
import { useEntityMetrics } from './hooks/useEntityMetrics';
import { MetricSummary, MetricsPerformance } from './components';

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
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
    },
    content: {
        position: 'relative',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    }
});

export const EntityDashboard = () => {
    const classes = useStyles();
    const { entity } = useEntity();
    const projectSlug = entity.metadata.annotations?.['sleuth.io/project-slug'];

    // return if projectId is missing
    if (!projectSlug) {
        return (
            <Alert severity="warning" className={classes.error}>
                No Sleuth project Slug found in entity annotations. Add the 'sleuth.io/project-slug' annotation to view DORA metrics.
                <br />
                Available annotations: {JSON.stringify(entity.metadata.annotations, null, 2)}
            </Alert>
        );
    }

    // Use custom hook for all data fetching and state
    const {
        metrics,
        insights,
        loading,
        error,
        selectedTimeRange,
        setSelectedTimeRange,
    } = useEntityMetrics(entity);

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
            <div className={classes.content}>
                {loading && (
                    <div className={classes.loadingOverlay}>
                        <CircularProgress />
                    </div>
                )}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <div className={classes.title}>DORA Metrics Overview</div>
                            <MetricSummary
                                metrics={metrics} 
                                insights={insights}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <div className={classes.title}>Detailed DORA Metrics</div>
                            <MetricsPerformance metrics={metrics}/>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};