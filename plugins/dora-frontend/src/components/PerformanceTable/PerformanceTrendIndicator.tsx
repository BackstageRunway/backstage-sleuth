
import { makeStyles } from '@material-ui/core/styles';
import { MetricType } from '../../DORAMetricModel';

interface PerformanceTrendIndicatorProps {
    width: number;
    metricName: MetricType;
    percentageChange: number;
    trend: 'improving' | 'ailing';
}

const useStyles = makeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    indicator: {
        width: '100%',
        height: '4px',
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        transition: 'width 0.3s ease-in-out',
    },
    improving: {
        backgroundColor: '#4caf50',
    },
    ailing: {
        backgroundColor: '#f44336',
    },
    percentage: {
        fontSize: '0.875rem',
        fontWeight: 500,
    },
    improvingText: {
        color: '#4caf50',
    },
    ailingText: {
        color: '#f44336',
    },
});

const PerformanceTrendIndicator = ({
    width,
  
    percentageChange,
    trend,
}: PerformanceTrendIndicatorProps) => {
    const classes = useStyles();

    const barWidth = Math.min(Math.abs(percentageChange), 100);
    const barStyle = {
        width: `${barWidth}%`,
    };

    return (
        <div className={classes.container} style={{ width: `${width}px` }}>
            <div className={classes.indicator}>
                <div
                    className={`${classes.bar} ${
                        trend === 'improving' ? classes.improving : classes.ailing
                    }`}
                    style={barStyle}
                />
            </div>
            <span
                className={`${classes.percentage} ${
                    trend === 'improving'
                        ? classes.improvingText
                        : classes.ailingText
                }`}
            >
                {percentageChange > 0 ? '+' : ''}
                {percentageChange}%
            </span>
        </div>
    );
};

export default PerformanceTrendIndicator;