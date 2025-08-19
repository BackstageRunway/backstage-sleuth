import { makeStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import DetailsTableRow from './MetricsPerformanceTableRow';

import { MetricData } from '../../common/types/metrics';

type Props = {
    metrics: MetricData[];
};

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    headerCell: {
        fontWeight: 'bold',
        textAlign: 'center',
        width: '120px',
    },
    metricCell: {
        width: '150px',
        textAlign: 'left',
    },
    trendCell: {
        width: '120px',
        textAlign: 'center',
    },
    title: {
        marginBottom: '1rem',
    },
});

const MetricsPerformanceTable = ({ metrics }: Props) => {
    const classes = useStyles();

    return (
        <div>
           
            <TableContainer component={Paper}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell>Trend</TableCell>
                            <TableCell className={classes.headerCell}>Low</TableCell>
                            <TableCell />
                            <TableCell className={classes.headerCell}>Medium</TableCell>
                            <TableCell />
                            <TableCell className={classes.headerCell}>High</TableCell>
                            <TableCell className={classes.headerCell}>Elite</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {metrics.map((metric) => (
                            <DetailsTableRow
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

export default MetricsPerformanceTable;