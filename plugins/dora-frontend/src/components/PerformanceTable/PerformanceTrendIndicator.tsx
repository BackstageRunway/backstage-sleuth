import { makeStyles } from '@material-ui/core/styles';
import { MetricType } from '../../DORAMetricModel';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

interface PerformanceTrendIndicatorProps {
    metricType: MetricType;
    percentageChange: number;
}

const useStyles = makeStyles({
    trendIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem',
        marginTop: '0.125rem',
    },
    percentage: {
        whiteSpace: 'nowrap',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
    },
    improving: {
        color: '#4caf50',
    },
    ailing: {
        color: '#f44336',
    },
    neutral: {
        color: '#757575',
    },
});

const PerformanceTrendIndicator = ({ metricType, percentageChange }: PerformanceTrendIndicatorProps): JSX.Element => {
    const classes = useStyles();

    const renderTrendIcon = () => {
        // For Frequency: up arrow (green) when increasing
        // For LeadTime, FailureRate, and Mttr: down arrow (green) when decreasing
        const isGood = (metricType === MetricType.Frequency && percentageChange > 0) ||
                      (metricType !== MetricType.Frequency && percentageChange < 0);

        // For Frequency: up arrow when increasing
        if (metricType === MetricType.Frequency) {
            return percentageChange > 0 ? 
                <TrendingUpIcon className={classes.improving} /> : 
                <TrendingDownIcon className={classes.ailing} />;
        }
        
        // For LeadTime, FailureRate, and Mttr: down arrow when decreasing
        return percentageChange < 0 ? 
            <TrendingDownIcon className={classes.improving} /> : 
            <TrendingUpIcon className={classes.ailing} />;
    };

    return (
        <div className={classes.trendIndicator}>
            {renderTrendIcon()}
            <span
                className={`${classes.percentage} ${
                    (metricType === MetricType.Frequency && percentageChange > 0) ||
                    (metricType !== MetricType.Frequency && percentageChange < 0)
                        ? classes.improving
                        : percentageChange === 0
                        ? classes.neutral
                        : classes.ailing
                }`}
            >
                {Math.abs(percentageChange).toFixed(1)}%
            </span>
        </div>
    );
};

export default PerformanceTrendIndicator;