import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import Tooltip from '@mui/material/Tooltip';
import { MetricType, Performance } from '../../DORAMetricModel';

// Constants
const COLORS = {
    BLUE: '#337ab7',
    GREY: '#d05dd',
} as const;

// Types
type IconStyleType = 'checkedCircle' | 'line' | 'trophy';

interface PerformanceStatusMarkerProps {
    iconStyle: IconStyleType;
    checked: boolean;
    previousChecked: boolean;
    width: number;
    metricName?: MetricType;
    performance?: Performance;
    toolTip?: string;
}

// Styles
const useStyles = makeStyles({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        color: COLORS.BLUE,
        fontSize: '1.2rem',
    },
    greyIcon: {
        color: COLORS.GREY,
        fontSize: '1.2rem',
    },
    line: {
        width: '100%',
        height: '2px',
        backgroundColor: COLORS.GREY,
    },
});

/**
 * PerformanceStatusMarker component displays different icons based on performance status
 * - checkedCircle: Shows filled/outlined/unchecked circle based on current and previous state
 * - trophy: Shows a trophy icon for achievements
 * - line: Shows a simple line divider
 */
const PerformanceStatusMarker = ({
    iconStyle,
    checked,
    previousChecked,
    width,
    toolTip
}: PerformanceStatusMarkerProps): JSX.Element => {
    const classes = useStyles();

    const containerStyle = {
        width: `${width}%`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const renderIcon = () => {
        switch (iconStyle) {
            case 'checkedCircle':
                return checked 
                    ? <CheckCircleIcon style={{ color: COLORS.BLUE }} />
                    : previousChecked
                    ? <CheckCircleOutlineIcon style={{ color: COLORS.GREY }} />
                    : <RadioButtonUncheckedIcon style={{ color: COLORS.GREY }} />;

            case 'trophy':
                return (
                    <EmojiEventsIcon
                        className={checked ? classes.icon : classes.greyIcon}
                        style={{ fontSize: '3rem' }}
                    />
                );

            case 'line':
                return <div className={classes.line} />;

            default:
                return null;
        }
    };

    return (
        <Tooltip title={toolTip || ''}>
            <div style={containerStyle}>
                {renderIcon()}
            </div>
        </Tooltip>
    );
};

export default PerformanceStatusMarker;