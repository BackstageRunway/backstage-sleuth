import { makeStyles } from '@material-ui/core/styles';
import { TableRow, TableCell } from '@material-ui/core';
import { MetricType, Performance, getPerformanceDescription } from '../../common/types/metrics';
import { TrendCell } from './TrendCell';
import { MetricPerformanceStatusMarker } from './MetricPerformanceStatusMarker';
import { METRIC_LABELS } from '../constants';
//import TrendingUpIcon from '@material-ui/icons/TrendingUp';
//import TrendingDownIcon from '@material-ui/icons/TrendingDown';

interface MetricsPerformanceTableRowProps {
    metricName: MetricType;
    value: Performance;
    previousValue: Performance;
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
}

const useStyles = makeStyles({
    cell: {
        textAlign: 'center',
    },
    nameCell: {
        whiteSpace: 'nowrap',
        wordBreak: 'normal',
    },
    statusCell: {
        minWidth: '110px',
        whiteSpace: 'nowrap',
    },
    trendUp: {
        color: 'green',
    },
    trendDown: {
        color: 'red',
    },
});

const MetricsPerformanceTableRow = ({
    metricName,
    value,
    previousValue,
    percentageChange,

}: MetricsPerformanceTableRowProps) => {
    const classes = useStyles();
    const performanceDescription = getPerformanceDescription(value);



    return (
        <TableRow>
            <TableCell className={classes.nameCell}>{METRIC_LABELS[metricName]}</TableCell>
            <TableCell className={classes.statusCell}>
                                        <TrendCell
                    metricType={metricName}
                    percentageChange={percentageChange}
                />
            </TableCell>
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.Low}
                    previousChecked={previousValue === Performance.Low}
                    width={100}
                    metricName={metricName}
                    performance={Performance.Low}
                    toolTip={performanceDescription}
                />
            </TableCell>
            <TableCell />
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.Medium}
                    previousChecked={previousValue === Performance.Medium}
                    width={100}
                    metricName={metricName}
                    performance={Performance.Medium}
                    toolTip={performanceDescription}
                />
            </TableCell>
            <TableCell />
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.High}
                    previousChecked={previousValue === Performance.High}
                    width={100}
                    metricName={metricName}
                    performance={Performance.High}
                    toolTip={performanceDescription}
                />
            </TableCell>
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="trophy"
                    checked={value === Performance.Elite}
                    previousChecked={previousValue === Performance.Elite}
                    width={100}
                    metricName={metricName}
                    performance={Performance.Elite}
                    toolTip={performanceDescription}
                />
            </TableCell>
        </TableRow>
    );
};

export default MetricsPerformanceTableRow; 