import React from 'react';
import { Card, CardContent, Typography, Tooltip, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MetricData } from './types';
import { getMetricDisplayValue, getMetricInsights } from './utils';
import { DeploymentTrendCell } from '../shared/DeploymentTrendCell';
import { METRIC_DESCRIPTIONS, METRIC_TARGETS } from './constants';

interface MetricCardProps {
    metric: MetricData;
}

const useStyles = makeStyles({
    card: {
        display: 'flex',
        height: '340px',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        transition: 'all 0.2s ease-in-out',
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
    },
    metricHeader: {
        marginBottom: '0.25rem',
    },
    metricName: {
        fontSize: '1.1rem',
        color: 'rgba(0, 0, 0, 0.6)',
    },
    metricValue: {
        fontSize: '2.5rem',
        fontWeight: 600,
        color: 'rgba(0, 0, 0, 0.87)',
        marginBottom: '0.25rem',
    },
    metricInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '0.125rem',
    },
    targetValue: {
        fontSize: '0.875rem',
        color: 'rgba(0, 0, 0, 0.6)',
    },
    divider: {
        width: '100%',
        margin: '1rem 0',
    },
    insightsList: {
        padding: 0,
        width: '100%',
        '& .MuiListItemText-root': {
            margin: 0,
            '& .MuiTypography-root': {
                fontSize: '0.875rem',
            },
        },
    },
    insightItem: {
        padding: '0.25rem 0',
    },
    insightIcon: {
        minWidth: '2rem',
    },
    goodInsight: {
        color: '#4caf50',
    },
    warningInsight: {
        color: '#ff9800',
    },
    criticalInsight: {
        color: '#f44336',
    },
    infoIcon: {
        fontSize: '1rem',
        marginRight: '0.5rem',
    },
});

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
    const classes = useStyles();
    const insights = getMetricInsights(
        metric.metricName,
        metric.rawValue,
        metric.percentageChange,
        classes
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
                    <DeploymentTrendCell
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
}; 