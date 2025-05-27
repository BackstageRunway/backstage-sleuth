import { makeStyles } from '@material-ui/core/styles';
import { MetricType } from '../../../DORAMetricModel';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

type Props = {
    metricType: MetricType;
    percentageChange: number;
};

const useStyles = makeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    value: {
        fontSize: '0.875rem',
        color: 'rgba(0, 0, 0, 0.87)',
    },
    improving: {
        color: '#4caf50',
    },
    ailing: {
        color: '#f44336',
    },
    neutral: {
        color: '#9e9e9e',
    },
});

export function DeploymentTrendCell({ metricType, percentageChange }: Props) {
    const classes = useStyles();
    const isImproving = (metricType === MetricType.Frequency || metricType === MetricType.LeadTime) 
        ? percentageChange > 0 
        : percentageChange < 0;

    const getTrendIcon = () => {
        if (percentageChange === 0) {
            return <TrendingFlatIcon className={classes.neutral} />;
        }
        return isImproving 
            ? <TrendingUpIcon className={classes.improving} />
            : <TrendingDownIcon className={classes.ailing} />;
    };

    const formatPercentage = (value: number) => {
        const absValue = Math.abs(value);
        return `${absValue.toFixed(1)}%`;
    };

    return (
        <div className={classes.container}>
            {getTrendIcon()}
            <span className={classes.value}>
                {formatPercentage(percentageChange)}
            </span>
        </div>
    );
} 