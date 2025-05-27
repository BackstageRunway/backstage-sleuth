import { useEntity } from '@backstage/plugin-catalog-react';
import { DORAMetricsView } from './DORAMetricsView';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { DORASummaryContainer } from '../dora/summary/DORASummaryContainer';
import { Grid, Paper } from '@material-ui/core';

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

export const EntityDoraMetrics = () => {
    const classes = useStyles();
    const { entity } = useEntity();

    // Get the project ID from entity annotations
    const projectId = entity.metadata.annotations?.['sleuth.io/project-id'];

    console.log('Entity:', entity);
    console.log('Project ID:', projectId);

    if (!projectId) {
        return (
            <Alert severity="warning" className={classes.error}>
                No Sleuth project ID found in entity annotations. Add the 'sleuth.io/project-id' annotation to view DORA metrics.
                <br />
                Available annotations: {JSON.stringify(entity.metadata.annotations, null, 2)}
            </Alert>
        );
    }

    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    return (
        <div className={classes.container}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>DORA Metrics Overview</div>
                        <DORASummaryContainer
                            projectId={projectId}
                            timeRange={{
                                start: start.toISOString(),
                                end: end.toISOString(),
                            }}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Detailed DORA Metrics</div>
                        <DORAMetricsView
                            projectId={projectId}
                            timeRange={{
                                start: start.toISOString(),
                                end: end.toISOString(),
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}; 