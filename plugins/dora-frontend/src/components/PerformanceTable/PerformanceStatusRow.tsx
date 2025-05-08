
import { TableRow, TableCell } from '@material-ui/core';
import { getPerformanceDescription, MetricType, Performance } from '../../DORAMetricModel';
import PerformanceMetricIndicator from './PerformanceTrendIndicator';
import PerformanceStatusMarker from './PerformanceStatusMarker';

interface PerformanceStatusRowProps {
    metricName: MetricType;
    value: Performance;
    previousValue: Performance;
    percentageChange: number;
    trend: 'improving' | 'ailing';
}

const INDICATOR_WIDTH = 100;

const PerformanceStatusRow = ({ 
    metricName, 
    value, 
    previousValue, 
    percentageChange, 
    trend 
}: PerformanceStatusRowProps) => {
    const performanceDescription = getPerformanceDescription(metricName);

    return (
        <TableRow>
            <TableCell>{metricName}</TableCell>
            <TableCell>
                <PerformanceMetricIndicator
                    width={INDICATOR_WIDTH}
                    metricName={metricName}
                    percentageChange={percentageChange}
                    trend={trend}
                />
            </TableCell>
            <TableCell>
                <PerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.elite}
                    previousChecked={previousValue === Performance.elite}
                    width={INDICATOR_WIDTH}
                    metricName={metricName}
                    performance={value}
                    toolTip={performanceDescription[Performance.elite]}
                />
            </TableCell>
            <TableCell>
                <PerformanceStatusMarker
                    iconStyle="line"
                    checked={false}
                    previousChecked={false}
                    width={INDICATOR_WIDTH}
                    performance={value}
                    toolTip={performanceDescription[Performance.high]}
                />
            </TableCell>
            <TableCell>
                <PerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.high}
                    previousChecked={previousValue === Performance.high}
                    width={INDICATOR_WIDTH}
                    metricName={metricName}
                    performance={value}
                    toolTip={performanceDescription[Performance.high]}
                />
            </TableCell>
            <TableCell>
                <PerformanceStatusMarker
                    iconStyle="line"
                    checked={false}
                    previousChecked={false}
                    width={INDICATOR_WIDTH}
                    performance={value}
                    toolTip={performanceDescription[Performance.medium]}
                />
            </TableCell>
            <TableCell>
                <PerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.medium}
                    previousChecked={previousValue === Performance.medium}
                    width={INDICATOR_WIDTH}
                    metricName={metricName}
                    performance={value}
                    toolTip={performanceDescription[Performance.medium]}
                />
            </TableCell>
            <TableCell>
                <PerformanceStatusMarker
                    iconStyle="trophy"
                    checked={value === Performance.low}
                    previousChecked={previousValue === Performance.low}
                    width={INDICATOR_WIDTH}
                    metricName={metricName}
                    performance={value}
                    toolTip={performanceDescription[Performance.low]}
                />
            </TableCell>
        </TableRow>
    );
};

export default PerformanceStatusRow;