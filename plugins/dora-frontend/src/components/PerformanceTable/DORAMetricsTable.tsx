import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MetricType, Performance } from '../../DORAMetricModel';
import PerformanceStatusRow from './PerformanceStatusRow';

interface DORAMetricsTableProps {
    metrics: {
        metricName: MetricType;
        value: Performance;
        previousValue: Performance;
        percentageChange: number;
        trend: 'improving' | 'ailing';
    }[];
}

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    headerCell: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    title: {
        marginBottom: '1rem',
    },
});

const DORAMetricsTable = ({ metrics }: DORAMetricsTableProps) => {
    const classes = useStyles();

    return (
        <div>
            <Typography variant="h6" className={classes.title}>
                DORA Metrics Performance
            </Typography>
            <TableContainer component={Paper}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell>Trend</TableCell>
                            <TableCell className={classes.headerCell}>Elite</TableCell>
                            <TableCell />
                            <TableCell className={classes.headerCell}>High</TableCell>
                            <TableCell />
                            <TableCell className={classes.headerCell}>Medium</TableCell>
                            <TableCell className={classes.headerCell}>Low</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {metrics.map((metric) => (
                            <PerformanceStatusRow
                                key={metric.metricName}
                                metricName={metric.metricName}
                                value={metric.value}
                                previousValue={metric.previousValue}
                                percentageChange={metric.percentageChange}
                                trend={metric.trend}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default DORAMetricsTable;