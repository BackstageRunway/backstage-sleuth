import React from 'react';
import { TableRow } from '@material-ui/core';
import { getPerformanceDescription, MetricType, Performance } from '../../DORAMetricModel';
import PerformanceMetricIndicator from './PerformanceTrendIndicator';
import PerformanceMetricMarker from './PerformanceStatusMarker';

interface PerformanceStatusRowProps {
    metricName: MetricType;
    value: Performance;
    previousValue: Performance;
    percentageChange: number;
    trend: 'ailing' | 'neutral' | 'improving';
}

const MARKER_WIDTH = 5;
const DIVIDER_WIDTH = 20;
const INDICATOR_WIDTH = 100;

const PerformanceStatusRow: React.FC<PerformanceStatusRowProps> = ({
    metricName,
    value,
    previousValue,
    percentageChange,
    trend
}) => {
    const performanceDescription = getPerformanceDescription(metricName);

    return (
        <TableRow>
            <td>
                <div>
                    <PerformanceMetricIndicator
                        width={INDICATOR_WIDTH}
                        metricName={metricName}
                        percentageChange={percentageChange}
                        trend={trend}
                    />
                </div>
            </td>
            <PerformanceMetricMarker
                iconStyle="checkedCircle"
                checked={value === Performance.low}
                previousChecked={previousValue === Performance.low}
                width={MARKER_WIDTH}
                metricName={metricName}
                performance={Performance.low}
                toolTip={performanceDescription[Performance.low]}
            />

            <PerformanceMetricMarker
                iconStyle="line"
                checked={false}
                previousChecked={false}
                width={DIVIDER_WIDTH}
                performance=""
                toolTip=""
            />

            <PerformanceMetricMarker
                iconStyle="checkedCircle"
                checked={value === Performance.medium}
                previousChecked={previousValue === Performance.medium}
                width={MARKER_WIDTH}
                metricName={metricName}
                performance={Performance.medium}
                toolTip={performanceDescription[Performance.medium]}
            />

            <PerformanceMetricMarker
                iconStyle="line"
                checked={false}
                previousChecked={false}
                width={DIVIDER_WIDTH}
                performance=""
                toolTip=""
            />

            <PerformanceMetricMarker
                iconStyle="trophy"
                checked={value === Performance.elite}
                previousChecked={previousValue === Performance.elite}
                width={MARKER_WIDTH}
                metricName={metricName}
                performance={Performance.elite}
                toolTip={performanceDescription[Performance.elite]}
            />
        </TableRow>
    );
};

export default PerformanceStatusRow;