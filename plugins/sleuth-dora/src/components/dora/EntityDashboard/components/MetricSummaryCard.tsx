import { MetricData, MetricType } from '../../common/types/metrics';
import { ApiInsight } from '../../common/types/api';
import { formatMetricValue, getMetricInsights } from '../../common';
import { TrendCell } from './TrendCell';
import { METRIC_DESCRIPTIONS, METRIC_LABELS, METRIC_TARGETS } from '../constants';
import { useStyles } from '../styles';
import { Card, CardContent, Typography, Tooltip, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';


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
                    <Tooltip title={METRIC_DESCRIPTIONS[metric.metricName as MetricType]}>
                        <Typography className={classes.metricName}>
                            {METRIC_LABELS[metric.metricName as MetricType]}
                        </Typography>
                    </Tooltip>
                    {/* Sleuth has no MTTR per code deployment; without this the figure reads as the component's own */}
                    {metric.metricName === MetricType.Mttr && (
                        <Typography className={classes.trendCaption}>whole project</Typography>
                    )}
                </div>
                <Typography className={classes.metricValue}>
                    {formatMetricValue(metric.rawValue, metric.metricName)}
                </Typography>
                <div className={classes.metricInfo}>
                    {/* the arrow compares periods; the tick below it rates the current level against the target */}
                    <div className={classes.trendRow}>
                        <TrendCell
                            metricType={metric.metricName}
                            percentageChange={metric.percentageChange}
                        />
                        {isFinite(metric.percentageChange) && (
                            <Typography className={classes.trendCaption}>vs previous period</Typography>
                        )}
                    </div>
                    <Typography className={classes.targetValue}>
                        Target: {METRIC_TARGETS[metric.metricName as MetricType]}
                    </Typography>
                </div>
                <Divider className={classes.divider} />
                <List className={classes.insightsList}>
                    {insights.map((item, index) => (
                        <ListItem key={index} className={classes.insightItem}>
                            <ListItemIcon className={classes.insightIcon}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text} 
                                primaryTypographyProps={{ color: 'textSecondary', style: { fontSize: '0.86rem' } }}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
} 