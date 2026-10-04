import { useEntity } from '@backstage/plugin-catalog-react';
import { Alert } from '@material-ui/lab';
import { makeStyles, alpha } from '@material-ui/core/styles';
import { CircularProgress, Grid, Paper } from '@material-ui/core';
import { TimeRangeSelector } from '../shared/components/TimeRangeSelector';
import { useEntityMetrics } from './hooks/useEntityMetrics';
import { MetricSummary, MetricsPerformance } from './components';
import { ENTITY_ANNOTATION_KEYS } from '../common/types/config';

const useStyles = makeStyles(theme => ({
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
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    }
}));

export const EntityDashboard = () => {
    const classes = useStyles();
    const { entity } = useEntity();
    // Use custom hook for all data fetching and state
    const {
        metrics,
        insights,
        hasDeployments,
        projectSlug,
        codeDeploymentSlug,
        loading,
        error,
        selectedTimeRange,
        setSelectedTimeRange,
    } = useEntityMetrics(entity);

    // Zeros would otherwise be rated as elite lead time and failure rate
    const emptyMessage = !loading && !error && !hasDeployments
        ? `No deployments recorded in Sleuth for "${codeDeploymentSlug}" in this period.`
        : null;

    // Without annotations the lookup falls back to the default project and the component's own name;
    // say so, since the numbers may belong to something else or to nothing
    const annotations = entity.metadata.annotations ?? {};
    const isMapped = Boolean(
        annotations[ENTITY_ANNOTATION_KEYS.PROJECT_SLUG] || annotations[ENTITY_ANNOTATION_KEYS.CODE_DEPLOYMENT_SLUG],
    );

    return (
        <div className={classes.container}>
            <TimeRangeSelector 
                selectedRange={selectedTimeRange}
                onRangeChange={setSelectedTimeRange}
            />
            {!isMapped && (
                <Alert severity="info" className={classes.error}>
                    This component has no Sleuth annotations, so it is looked up as code deployment
                    "{codeDeploymentSlug}" in the default project "{projectSlug}". Add{' '}
                    <code>{ENTITY_ANNOTATION_KEYS.PROJECT_SLUG}</code> and{' '}
                    <code>{ENTITY_ANNOTATION_KEYS.CODE_DEPLOYMENT_SLUG}</code> to map it explicitly.
                </Alert>
            )}
            {error && (
                <Alert severity="error" className={classes.error}>
                    {error}
                </Alert>
            )}
            {emptyMessage && (
                <Alert severity="info" className={classes.error}>
                    {emptyMessage}
                </Alert>
            )}
            {!error && !emptyMessage && (
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
            )}
        </div>
    );
};