
import { Grid } from '@material-ui/core';
import { MetricData } from './types';
import { useStyles } from './styles';
import { MetricCard } from './MetricCard';

type Props = {
    metrics: MetricData[];
};

export function DORASummaryContainer({ metrics }: Props) {
    const classes = useStyles();
   

    return (
        <div className={classes.container}>
            <Grid container spacing={3}>
                {metrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={3} key={metric.metricName}>
                        <MetricCard metric={metric} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
} 