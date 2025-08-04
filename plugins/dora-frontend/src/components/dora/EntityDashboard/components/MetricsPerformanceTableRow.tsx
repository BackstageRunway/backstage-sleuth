import { makeStyles } from '@material-ui/core/styles';
import { TableRow, TableCell } from '@material-ui/core';
import { MetricType, Performance, getPerformanceDescription } from '../../../../DORAMetricModel';
import { TrendCell } from './TrendCell';
import { MetricPerformanceStatusMarker } from './MetricPerformanceStatusMarker';
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
    statusCell: {
        width: '100px',
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
    trend,
}: MetricsPerformanceTableRowProps) => {
    const classes = useStyles();
    const performanceDescription = getPerformanceDescription(metricName);
    console.log(trend);

    // const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    //     switch (trend) {
    //         case 'up':
    //             return <TrendingUpIcon className={classes.trendUp} />;
    //         case 'down':
    //             return <TrendingDownIcon className={classes.trendDown} />;
    //         default:
    //             return null;
    //     }
    // };

    return (
        <TableRow>
            <TableCell>{metricName}</TableCell>
            <TableCell className={classes.statusCell}>
                                        <TrendCell
                    metricType={metricName}
                    percentageChange={percentageChange}
                />
            </TableCell>
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.low}
                    previousChecked={previousValue === Performance.low}
                    width={100}
                    metricName={metricName}
                    performance={Performance.low}
                    toolTip={performanceDescription[Performance.low]}
                />
            </TableCell>
            <TableCell />
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.medium}
                    previousChecked={previousValue === Performance.medium}
                    width={100}
                    metricName={metricName}
                    performance={Performance.medium}
                    toolTip={performanceDescription[Performance.medium]}
                />
            </TableCell>
            <TableCell />
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="checkedCircle"
                    checked={value === Performance.high}
                    previousChecked={previousValue === Performance.high}
                    width={100}
                    metricName={metricName}
                    performance={Performance.high}
                    toolTip={performanceDescription[Performance.high]}
                />
            </TableCell>
            <TableCell className={classes.cell}>
                <MetricPerformanceStatusMarker
                    iconStyle="trophy"
                    checked={value === Performance.elite}
                    previousChecked={previousValue === Performance.elite}
                    width={100}
                    metricName={metricName}
                    performance={Performance.elite}
                    toolTip={performanceDescription[Performance.elite]}
                />
            </TableCell>
        </TableRow>
    );
};

export default MetricsPerformanceTableRow; 