import { makeStyles } from '@material-ui/core/styles';
import { MetricType } from '../../common/types/metrics';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

type Props = {
    metricType: MetricType;
    percentageChange: number;
};

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    value: {
        fontSize: '0.875rem',
        color: theme.palette.text.primary,
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
}));

export function TrendCell({ metricType, percentageChange }: Props) {
    const classes = useStyles();
    
    const getTrendIcon = () => {
        if (isNaN(percentageChange) || percentageChange === 0) {
            return <TrendingFlatIcon className={classes.neutral} />;
        }

        // For lead time, failure rate, and MTTR, show down arrow when decreasing
        if (metricType !== MetricType.Frequency && percentageChange < 0) {
            return <TrendingDownIcon className={classes.improving} />;
        }
        
        // For frequency, show up arrow when increasing
        if (metricType === MetricType.Frequency && percentageChange > 0) {
            return <TrendingUpIcon className={classes.improving} />;
        }

        // Otherwise show the opposite trend in red
        return percentageChange > 0 
            ? <TrendingUpIcon className={classes.ailing} />
            : <TrendingDownIcon className={classes.ailing} />;
    };

    const formatPercentage = (value: number) => {
        if (isNaN(value)) return '0%';
        if (!isFinite(value)) return 'new';
        const absValue = Math.abs(value);
        return absValue > 999 ? '>999%' : `${Math.round(absValue)}%`;
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