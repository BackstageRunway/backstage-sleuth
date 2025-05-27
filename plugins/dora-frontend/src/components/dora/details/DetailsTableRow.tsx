import { makeStyles } from '@material-ui/core/styles';
import { TableRow, TableCell } from '@material-ui/core';
import { MetricType, Performance, getPerformanceDescription } from '../../../DORAMetricModel';
import { DeploymentTrendCell } from '../shared/DeploymentTrendCell';
import { MetricStatusMarker } from '../shared/MetricStatusMarker';

interface DetailsTableRowProps {
    metricName: MetricType;
    value: Performance;
    previousValue: Performance;
    percentageChange: number;
    trend: 'improving' | 'ailing';
}

const useStyles = makeStyles({
    cell: {
        textAlign: 'center',
    },
    statusCell: {
        width: '100px',
    },
});

const DetailsTableRow = ({
    metricName,
    value,
    previousValue,
    percentageChange,
}: DetailsTableRowProps) => {
    const classes = useStyles();
    const performanceDescription = getPerformanceDescription(metricName);

    return (
        <TableRow>
            <TableCell>{metricName}</TableCell>
            <TableCell className={classes.statusCell}>
                <DeploymentTrendCell
                    metricType={metricName}
                    percentageChange={percentageChange}
                />
            </TableCell>
            <TableCell className={classes.cell}>
                <MetricStatusMarker
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
                <MetricStatusMarker
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
                <MetricStatusMarker
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
                <MetricStatusMarker
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

export default DetailsTableRow; 