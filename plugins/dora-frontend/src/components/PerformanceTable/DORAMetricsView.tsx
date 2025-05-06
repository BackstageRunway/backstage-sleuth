import { useEffect, useRef, useState } from "react";
import { useApi } from "@backstage/core-plugin-api";
import { Chip, Grid } from "@material-ui/core";
import { useEntity } from "@backstage/plugin-catalog-react";
import { doraApiRef } from "../../api/DORABackendClient";
import { IProjectMetricResponse, ITeamMetricResponse } from "../../DORAMetricModel";
import PerformanceTable from "./DORAMetricsTable";

interface DateRangeChip {
    label: string;
    value: string;
    key: number;
}

const DATE_RANGE_CHIPS: DateRangeChip[] = [
    { label: 'Last 7 days', value: 'Last7Days', key: 1 },
    { label: 'Last 14 days', value: 'Last14Days', key: 2 },
    { label: 'Last 28 days', value: 'Last28Days', key: 3 },
    { label: 'Quarter', value: 'Quarter', key: 4 }
];

const DEFAULT_DATE_RANGE: DateRangeChip = DATE_RANGE_CHIPS[0];

const CHIP_CONTAINER_STYLE = {
    display: 'flex',
    justifyContent: 'center'
};

const CHIP_WRAPPER_STYLE = {
    display: 'flex',
    flex: '1',
    justifyContent: 'center'
};

const DORAMetricsView = (): JSX.Element => {
    const service = useApi(doraApiRef);
    const { entity } = useEntity();
    const isEntityTeamRef = useRef(false);

    const [teamMetrics, setTeamMetrics] = useState<ITeamMetricResponse | null>(null);
    const [projectMetrics, setProjectMetrics] = useState<IProjectMetricResponse | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangeChip>(DEFAULT_DATE_RANGE);

    const handleDateRangeChange = (chip: DateRangeChip) => {
        setSelectedDateRange(chip);
    };

    const fetchTeamMetrics = async (team: string, dateRange: string) => {
        const response = await service.getTeamDORAMetrics(team, dateRange);
        setTeamMetrics(response);
    };

    const fetchProjectMetrics = async (project: string, env: string, deployment: string, dateRange: string) => {
        const response = await service.getProjectDORAMetrics(project, env, deployment, dateRange);
        console.log(response)
        // TODO: Remove dummy data when API is ready
        const dummyProjectMetricResponse: IProjectMetricResponse = {
            project: {
                name: 'Example Project',
                currentRange: {
                    avgLeadTimeInSec: 21850,
                    avgMttrDurationInSec: 782,
                    failureRatePercent: 16.67,
                    numOfDeploys: 6,
                    numOfDeploysPerDay: 0.43,
                },
                previousRange: {
                    avgLeadTimeInSec: 78001,
                    avgMttrDurationInSec: 1582,
                    failureRatePercent: 54.55,
                    numOfDeploys: 11,
                    numOfDeploysPerDay: 0.79,
                },
            },
        };

        setProjectMetrics(dummyProjectMetricResponse);
    };

    useEffect(() => {
        if (entity?.spec?.type === 'team') {
            isEntityTeamRef.current = true;
            fetchTeamMetrics(entity.metadata.name, selectedDateRange.value);
        } else {
            isEntityTeamRef.current = false;
            fetchProjectMetrics('project', 'production', 'deployment', selectedDateRange.value);
        }
    }, [selectedDateRange, entity]);

    const renderDateRangeChips = () => (
        <div style={CHIP_WRAPPER_STYLE}>
            {DATE_RANGE_CHIPS.map(chip => (
                <Chip
                    key={chip.key}
                    label={chip.label}
                    color={selectedDateRange.key === chip.key ? 'primary' : 'secondary'}
                    onClick={() => handleDateRangeChange(chip)}
                />
            ))}
        </div>
    );

    const renderMetricsTable = () => {
        if (isEntityTeamRef.current) {
            return (
                <Grid item xs={6}>
                    <PerformanceTable data={teamMetrics?.team} />
                </Grid>
            );
        }
        return (
            <Grid item xs={6}>
                <PerformanceTable data={projectMetrics?.project} />
            </Grid>
        );
    };

    return (
        <div>
            <Grid container>
                <Grid style={CHIP_CONTAINER_STYLE} item xs={12} md={12} lg={12}>
                    {renderDateRangeChips()}
                </Grid>
                <Grid item xs={12} md={12} lg={12} />
                {renderMetricsTable()}
            </Grid>
        </div>
    );
};

export { DORAMetricsView };