import React from 'react';
import { Grid, Table, TableBody } from '@material-ui/core';
import { 
    IMetric, 
    MetricType, 
    calculateTrendChange, 
    getMetricPerformance, 
    getTrend, 
    secondsToDays
} from '../../DORAMetricModel';
import PerformanceMetricRow from './PerformanceStatusRow';

interface DORAMetricsTableProps {
    data: IMetric | null | undefined;
}

const TABLE_WIDTH = '600px';
const PERFORMANCE_LEVELS = ['Low', 'Med', 'High', 'Elite'];

const DORAMetricsTable: React.FC<DORAMetricsTableProps> = ({ data }) => {
    if (!data) {
        return <div>Loading ...</div>;
    }

    const {
        currentRange,
        previousRange
    } = data;

    const frequency = getMetricPerformance(
        MetricType.Frequency,
        currentRange.numOfDeploysPerDay,
    );

    const previousFrequency = getMetricPerformance(
        MetricType.Frequency,
        previousRange.numOfDeploysPerDay,
    );

    const leadTime = getMetricPerformance(
        MetricType.LeadTime,
        currentRange.avgLeadTimeInSec,
    );

    const previousLeadTime = getMetricPerformance(
        MetricType.LeadTime,
        previousRange.avgLeadTimeInSec,
    );

    const failureRate = getMetricPerformance(
        MetricType.FailureRate,
        currentRange.failureRatePercent,
    );

    const previousFailureRate = getMetricPerformance(
        MetricType.FailureRate,
        previousRange.failureRatePercent,
    );

    const mttr = getMetricPerformance(
        MetricType.Mttr,
        currentRange.avgMttrDurationInSec,
    );

    const previousMttr = getMetricPerformance(
        MetricType.Mttr,
        previousRange.avgMttrDurationInSec,
    );

    const renderPerformanceLevels = () => (
        <tr>
            <td></td>
            <td></td>
            {PERFORMANCE_LEVELS.map((level, index) => (
                <React.Fragment key={level}>
                    <td>{level}</td>
                    {index < PERFORMANCE_LEVELS.length - 1 && <td/>}
                </React.Fragment>
            ))}
        </tr>
    );

    return (
        <Grid container>
            <Grid item style={{ width: TABLE_WIDTH }}>
                <Table>
                    <TableBody>
                        {renderPerformanceLevels()}
                        
                        <PerformanceMetricRow
                            metricName={MetricType.Frequency}
                            value={frequency}
                            previousValue={previousFrequency}
                            percentageChange={calculateTrendChange(
                                currentRange.numOfDeploysPerDay, 
                                previousRange.numOfDeploysPerDay
                            )}
                            trend={getTrend(
                                MetricType.Frequency,
                                currentRange.numOfDeploysPerDay, 
                                previousRange.numOfDeploysPerDay
                            )}
                        />

                        <PerformanceMetricRow
                            metricName={MetricType.LeadTime}
                            value={leadTime}
                            previousValue={previousLeadTime}
                            percentageChange={calculateTrendChange(
                                secondsToDays(currentRange.avgLeadTimeInSec), 
                                secondsToDays(previousRange.avgLeadTimeInSec)
                            )}
                            trend={getTrend(
                                MetricType.LeadTime,
                                currentRange.avgLeadTimeInSec, 
                                previousRange.avgLeadTimeInSec
                            )}
                        />

                        <PerformanceMetricRow
                            metricName={MetricType.FailureRate}
                            value={failureRate}
                            previousValue={previousFailureRate}
                            percentageChange={calculateTrendChange(
                                currentRange.failureRatePercent, 
                                previousRange.failureRatePercent
                            )}
                            trend={getTrend(
                                MetricType.FailureRate,
                                currentRange.failureRatePercent, 
                                previousRange.failureRatePercent
                            )}
                        />

                        <PerformanceMetricRow
                            metricName={MetricType.Mttr}
                            value={mttr}
                            previousValue={previousMttr}
                            percentageChange={calculateTrendChange(
                                currentRange.avgMttrDurationInSec, 
                                previousRange.avgMttrDurationInSec
                            )}
                            trend={getTrend(
                                MetricType.Mttr,
                                currentRange.avgMttrDurationInSec, 
                                previousRange.avgMttrDurationInSec
                            )}
                        />
                    </TableBody>
                </Table>
            </Grid>
        </Grid>
    );
};

export default DORAMetricsTable;