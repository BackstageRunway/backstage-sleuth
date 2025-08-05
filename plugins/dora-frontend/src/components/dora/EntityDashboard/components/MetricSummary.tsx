import { Grid } from '@material-ui/core';
import { MetricData } from '../../common/types/metrics';
import { ApiInsight } from '../../common/types/api';
import { useStyles } from '../styles';
import { MetricSummaryCard } from './MetricSummaryCard';

type Props = {
    metrics: MetricData[];
    insights: ApiInsight[];
};

export function MetricSummary({ metrics, insights }: Props) {
    const classes = useStyles();
   
    return (
        <div className={classes.container}>
            <Grid container spacing={3}>
                {metrics.map((metric) => {
                    const metricInsight = insights.find(insight => insight.metricType === metric.metricName);
                    return (
                        <Grid item xs={12} sm={6} md={3} key={metric.metricName}>
                            <MetricSummaryCard metric={metric} insight={metricInsight} />
                        </Grid>
                    );
                })}
            </Grid>
        </div>
    );
} 