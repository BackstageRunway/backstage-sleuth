import { makeStyles } from '@material-ui/core/styles';
import { Tooltip } from '@material-ui/core';
import { MetricType, Performance } from '../../../../DORAMetricModel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

interface MetricPerformanceStatusMarkerProps {
    iconStyle: 'checkedCircle' | 'trophy';
    checked: boolean;
    previousChecked?: boolean;
    width?: number;
    metricName: MetricType;
    performance: Performance;
    toolTip: string;
}

const useStyles = makeStyles({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    icon: {
        fontSize: '1.5rem',
    },
    checked: {
        color: '#4caf50',
    },
    unchecked: {
        color: '#9e9e9e',
    },
    previousChecked: {
        color: '#bdbdbd',
    },
});

export function MetricPerformanceStatusMarker({
    iconStyle,
    checked,
    previousChecked,
    width = 100,
    toolTip,
}: MetricPerformanceStatusMarkerProps) {
    const classes = useStyles();

    const getIcon = () => {
        if (iconStyle === 'trophy') {
            return checked ? (
                <EmojiEventsIcon className={`${classes.icon} ${classes.checked}`} />
            ) : (
                <EmojiEventsIcon className={`${classes.icon} ${classes.unchecked}`} />
            );
        }

        if (checked) {
            return <CheckCircleIcon className={`${classes.icon} ${classes.checked}`} />;
        }

        if (previousChecked) {
            return <CheckCircleIcon className={`${classes.icon} ${classes.previousChecked}`} />;
        }

        return <RadioButtonUncheckedIcon className={`${classes.icon} ${classes.unchecked}`} />;
    };

    return (
        <Tooltip title={toolTip} arrow>
            <div className={classes.container} style={{ width }}>
                {getIcon()}
            </div>
        </Tooltip>
    );
} 