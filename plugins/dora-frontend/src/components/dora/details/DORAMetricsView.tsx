import { makeStyles } from '@material-ui/core/styles';
import { MetricType, Performance } from '../../../DORAMetricModel';
import DetailsTable from './DetailsTable';
import { MetricData } from '../summary/types';

import { Grid } from '@material-ui/core';

const useStyles = makeStyles({
    container: {
        padding: '1rem',
    },
    error: {
        marginBottom: '1rem',
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
    },
});

type Props = {
    metrics: MetricData[];
};

export function DORAMetricsView({ metrics }: Props) {
    const classes = useStyles();
    
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <div className={classes.container}>
                    <DetailsTable metrics={metrics} />
                </div>
            </Grid>
        </Grid>
    );
}