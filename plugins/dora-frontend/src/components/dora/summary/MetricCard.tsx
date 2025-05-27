import React from 'react';
import { Card, CardContent, Typography, Tooltip, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { MetricData } from './types';
import { METRIC_DESCRIPTIONS, METRIC_TARGETS } from './constants';
import { useStyles } from './styles';
import { getMetricDisplayValue, getMetricInsights } from './utils.tsx';
import PerformanceTrendIndicator from '../../PerformanceTable/PerformanceTrendIndicator';

interface MetricCardProps {
    metric: MetricData;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
                <div className={classes.metricHeader}>
                    <Typography className={classes.metricName} variant="h6">
                        {metric.metricName}
                        <Tooltip title={METRIC_DESCRIPTIONS[metric.metricName]}>
                            <InfoIcon className={classes.infoIcon} />
                        </Tooltip>
                    </Typography>
                    <Typography className={classes.metricValue}>
                        {getMetricDisplayValue(metric.metricName, metric.rawValue)}
                    </Typography>
                    <PerformanceTrendIndicator 
                        metricType={metric.metricName}
                        percentageChange={metric.percentageChange}
                    />
                </div>

                <Typography className={classes.metricInfo}>
                    <span className={classes.targetValue}>
                        {METRIC_TARGETS[metric.metricName]}
                    </span>
                </Typography>

                <Divider className={classes.divider} />

                <List className={classes.insightsList}>
                    {getMetricInsights(metric.metricName, metric.rawValue, metric.percentageChange, classes).map((insight, index) => (
                        <ListItem key={index} className={classes.insightItem}>
                            <ListItemIcon className={classes.insightIcon}>
                                {insight.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={insight.text}
                                primaryTypographyProps={{
                                    variant: 'body2',
                                    color: 'textSecondary'
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}; 