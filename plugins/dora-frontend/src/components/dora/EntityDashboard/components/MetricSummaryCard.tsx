import { MetricData, ApiInsight } from '../../shared/components/types';
import { getMetricDisplayValue, getMetricInsights } from '../utils';
import { TrendCell } from './TrendCell';
import { METRIC_DESCRIPTIONS, METRIC_TARGETS } from '../constants';
import { useStyles } from '../styles';
import { Card, CardContent, Typography, Tooltip, Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

type Props = {
    metric: MetricData;
    insight?: ApiInsight;
};

export function MetricSummaryCard({ metric, insight }: Props) {
    const classes = useStyles();
    const insights = getMetricInsights(
        metric.metricName,
        metric.rawValue,
        metric.percentageChange,
        classes,
        insight
    );

    return (
        <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
                <div className={classes.metricHeader}>
                    <Tooltip title={METRIC_DESCRIPTIONS[metric.metricName]}>
                        <Typography className={classes.metricName}>
                            {metric.metricName}
                        </Typography>
                    </Tooltip>
                </div>
                <Typography className={classes.metricValue}>
                    {getMetricDisplayValue(metric.metricName, metric.rawValue)}
                </Typography>
                <div className={classes.metricInfo}>
                    <TrendCell
                        metricType={metric.metricName}
                        percentageChange={metric.percentageChange}
                    />
                    <Typography className={classes.targetValue}>
                        Target: {METRIC_TARGETS[metric.metricName]}
                    </Typography>
                </div>
                <Divider className={classes.divider} />
                <List className={classes.insightsList}>
                    {insights.map((insight, index) => (
                        <ListItem key={index} className={classes.insightItem}>
                            <ListItemIcon className={classes.insightIcon}>
                                {insight.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={insight.text} 
                                primaryTypographyProps={{ style: { fontSize: '0.86rem', color: 'rgba(0, 0, 0, 0.6)' } }}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
} 