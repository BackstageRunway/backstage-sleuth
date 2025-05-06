import React from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { TableCell } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import Tooltip from '@mui/material/Tooltip';

type IconStyleType = 'checkedCircle' | 'line' | 'trophy';

interface PerformanceStatusMarkerProps {
    iconStyle: IconStyleType;
    checked: boolean;
    previousChecked: boolean;
    width: number;
    metricName?: string;
    performance?: string;
    toolTip?: string;
}

const BLUE_COLOR = '#337ab7';
const GREY_COLOR = '#d05dd';

const PerformanceStatusMarker: React.FC<PerformanceStatusMarkerProps> = ({
    iconStyle,
    checked,
    previousChecked,
    width,
    metricName,
    performance,
    toolTip
}) => {
    const containerStyle: React.CSSProperties = {
        width: `${width}%`,
        position: 'relative',
        paddingLeft: '5px',
        paddingRight: '5px',
    };

    const dividerStyle: React.CSSProperties = {
        width: '100%',
        height: '1px',
        backgroundColor: 'grey',
        position: 'absolute',
        top: '50%',
        left: '0',
        transform: 'translateY(-50%)',
    };

    const checkCellStyle: React.CSSProperties = {
        maxWidth: `${width}%`,
    };

    const commonCircleOutline = (
        <CheckCircleOutlineIcon style={{ color: GREY_COLOR }} />
    );

    const commonUncheckedCircle = (
        <RadioButtonUncheckedIcon style={{ color: GREY_COLOR }} />
    );

    const iconMap: Record<IconStyleType, React.ReactNode> = {
        checkedCircle: checked ? (
            <CheckCircleIcon style={{ color: BLUE_COLOR }} />
        ) : previousChecked && !checked ? (
            commonCircleOutline
        ) : (
            commonUncheckedCircle
        ),

        line: <div style={dividerStyle} />,

        trophy: checked ? (
            <ThumbUpIcon style={{ color: BLUE_COLOR }} />
        ) : previousChecked && !checked ? (
            commonCircleOutline
        ) : (
            commonUncheckedCircle
        )
    };

    const tooltipContent = iconStyle !== 'line' ? (
        <div>
            <span>
                {metricName}: {performance}
                <br />
                {toolTip}
            </span>
        </div>
    ) : null;

    return (
        <Tooltip placement="top" title={tooltipContent}>
            <TableCell
                style={
                    iconStyle === 'checkedCircle'
                        ? { ...containerStyle, ...checkCellStyle }
                        : containerStyle
                }
            >
                <div>{iconMap[iconStyle]}</div>
            </TableCell>
        </Tooltip>
    );
};

export default PerformanceStatusMarker;