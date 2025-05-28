import { Grid } from '@material-ui/core';
import { MetricData, ApiInsight } from './types';
import { useStyles } from './styles';
import { MetricCard } from './MetricCard';

type Props = {
    metrics: MetricData[];
    insights: ApiInsight[];
};

export function DORASummaryContainer({ metrics, insights }: Props) {
    const classes = useStyles();
   
    return (
        <div className={classes.container}>
            <Grid container spacing={3}>
                {metrics.map((metric) => {
                    const metricInsight = insights.find(insight => insight.metricType === metric.metricName);
                    return (
                        <Grid item xs={12} sm={6} md={3} key={metric.metricName}>
                            <MetricCard metric={metric} insight={metricInsight} />
                        </Grid>
                    );
                })}
            </Grid>
        </div>
    );
} 