import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import Tooltip from '@mui/material/Tooltip';
import { MetricType, Performance } from '../../DORAMetricModel';

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

const BLUE_COLOR = '#337ab7';
const GREY_COLOR = '#d05dd';

const useStyles = makeStyles({
    icon: {
        color: BLUE_COLOR,
        fontSize: '1.2rem',
    },
    greyIcon: {
        color: GREY_COLOR,
        fontSize: '1.2rem',
    },
    line: {
        width: '100%',
        height: '2px',
        backgroundColor: GREY_COLOR,
    },
});

const PerformanceStatusMarker = ({
    iconStyle,
    checked,
    width,
    toolTip
}: PerformanceStatusMarkerProps) => {
    const classes = useStyles();

    const containerStyle: React.CSSProperties = {
        width: `${width}%`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const renderIcon = () => {
        switch (iconStyle) {
            case 'checkedCircle':
                return (
                    <CheckCircleIcon
                        className={checked ? classes.icon : classes.greyIcon}
                    />
                );
            case 'trophy':
                return (
                    <ThumbUpIcon
                        className={checked ? classes.icon : classes.greyIcon}
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