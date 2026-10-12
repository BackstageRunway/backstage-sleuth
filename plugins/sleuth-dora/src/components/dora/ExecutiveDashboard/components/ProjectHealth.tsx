import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent, CircularProgress } from '@material-ui/core';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDuration } from '../../common/utils/formatters';

interface ProjectHealthProps {
    data: any;
    loading: boolean;
    error: string | null;
}

const useStyles = makeStyles(theme => ({
    card: {
        height: '100%',
        // the light gradient would leave theme-coloured text unreadable in dark mode
        background: theme.palette.type === 'dark'
            ? theme.palette.background.default
            : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
        },
    },
    metricTitle: {
        fontSize: '1.2rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
        color: theme.palette.text.primary,
        textAlign: 'center',
    },
    projectName: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: theme.palette.text.primary,
    },
    metricValue: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: theme.palette.text.primary,
    },
    metricLabel: {
        fontSize: '0.875rem',
        color: theme.palette.text.secondary,
        marginBottom: '0.5rem',
    },
    chartContainer: {
        height: '200px',
        marginTop: '1rem',
    },
    progressBar: {
        height: '8px',
        borderRadius: '4px',
        backgroundColor: '#ecf0f1',
        '& .MuiLinearProgress-bar': {
            borderRadius: '4px',
        },
    },
    good: {
        '& .MuiLinearProgress-bar': {
            backgroundColor: '#2ecc71',
        },
    },
    warning: {
        '& .MuiLinearProgress-bar': {
            backgroundColor: '#f1c40f',
        },
    },
    critical: {
        '& .MuiLinearProgress-bar': {
            backgroundColor: '#e74c3c',
        },
    },
    trendContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '4px',
    },
    improving: {
        color: '#2ecc71',
    },
    ailing: {
        color: '#e74c3c',
    },
    neutral: {
        color: '#95a5a6',
    },
    changeValue: {
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    comparisonContainer: {
        marginTop: '1rem',
        padding: '1rem',
        background: theme.palette.action.hover,
        borderRadius: '8px',
    },
    barLabel: {
        fontSize: '0.75rem',
        fill: theme.palette.text.secondary,
    },
}));



// The selected range is split into four equal slices; label each by the day it starts
const periodLabel = (startIncl: string) =>
    new Date(startIncl).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

// Durations are plotted in the largest unit their biggest value fills, so the axis stays readable
const durationScale = (maxSeconds: number) => {
    if (maxSeconds >= 2 * 86400) return { unit: 'd', seconds: 86400 };
    if (maxSeconds >= 3600) return { unit: 'h', seconds: 3600 };
    return { unit: 'm', seconds: 60 };
};

export const ProjectHealth = ({ data, loading, error }: ProjectHealthProps) => {
    const classes = useStyles();
    const theme = useTheme();

    const metrics = [
        {
            title: 'Deployment Frequency',
            key: 'numOfDeploysPerDay',
            unit: '/day',
            format: (value: number) => value.toFixed(2),
            color: '#2ecc71',
        },
        {
            title: 'Lead Time',
            key: 'avgLeadTimeInSec',
            unit: '',
            duration: true,
            format: formatDuration,
            color: '#3498db',
        },
        {
            title: 'Failure Rate',
            key: 'failureRatePercent',
            unit: '%',
            format: (value: number) => value.toFixed(1),
            color: '#e74c3c',
        },
        {
            title: 'MTTR',
            key: 'avgMttrDurationInSec',
            unit: '',
            duration: true,
            format: formatDuration,
            color: '#f1c40f',
        },
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">Failed to load organization metrics: {error}</Typography>
            </Box>
        );
    }

    const quartersData = data?.organization?.metricsRecapWithQuarters?.quarters;
    
    if (!quartersData || quartersData.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="textSecondary">No trend data available</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {metrics.map((metric) => {
                const rawValues: number[] = quartersData.map((quarter: any) => quarter[metric.key] as number);
                const scale = metric.duration ? durationScale(Math.max(...rawValues)) : null;
                const unit = scale ? scale.unit : metric.unit;
                return (
                <Grid item xs={12} sm={6} md={3} key={metric.title}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography className={classes.metricTitle}>
                                {metric.title}
                            </Typography>
                            <Box className={classes.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={quartersData.map((quarter: any) => ({
                                            name: periodLabel(quarter.startIncl),
                                            raw: quarter[metric.key as keyof typeof quarter] as number,
                                            // plotted in the displayed unit so the axis matches the unit below
                                            value: scale
                                                ? Number(((quarter[metric.key as keyof typeof quarter] as number) / scale.seconds).toFixed(1))
                                                : Number(metric.format(quarter[metric.key as keyof typeof quarter] as number)),
                                        }))}
                                        margin={{ top: 20, right: 8, left: -8, bottom: 5 }}
                                    >
                                        <XAxis dataKey="name" interval={0} tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
                                        <YAxis tick={{ fill: theme.palette.text.secondary }} />
                                        <Tooltip
                                            formatter={(value, _name, item) => [
                                                scale ? formatDuration(item?.payload?.raw ?? 0) : `${value}${unit}`,
                                                '',
                                            ]}
                                            labelFormatter={label => `From ${label}`}
                                            contentStyle={{
                                                background: theme.palette.background.paper,
                                                color: theme.palette.text.primary,
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={metric.color} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                            <Grid container spacing={1} className={classes.comparisonContainer}>
                                {quartersData.map((quarter: any, index: number) => {
                                    const value = quarter[metric.key as keyof typeof quarter] as number;
                                    
                                                                         return (
                                         <Grid item xs={3} key={`quarter-${index}`}>
                                             <Box display="flex" flexDirection="column" alignItems="center">
                                                 <Typography
                                                     className={classes.projectName}
                                                     style={{
                                                         fontWeight: 400,
                                                         fontSize: '0.75rem',
                                                         height: '2em',
                                                         lineHeight: '1em',
                                                         display: 'flex',
                                                         alignItems: 'center',
                                                         justifyContent: 'center',
                                                         textAlign: 'center',
                                                         overflow: 'hidden',
                                                         whiteSpace: 'pre-line',
                                                     }}
                                                 >
                                                     {periodLabel(quarter.startIncl)}
                                                 </Typography>
                                                                                                   <Typography 
                                                      className={classes.metricValue}
                                                      // four slices share the card, too narrow for "17d 7h" on one line, so durations may wrap
                                                      style={{ fontSize: scale ? '0.78rem' : '0.9rem', whiteSpace: scale ? 'normal' : 'nowrap', textAlign: 'center', lineHeight: 1.2 }}
                                                  >
                                                      {/* a slice with no deployments has no lead time, failure rate or MTTR to show */}
                                                      {metric.key !== 'numOfDeploysPerDay' && quarter.numOfDeploysPerDay === 0
                                                          ? '–'
                                                          : metric.format(value)}
                                                  </Typography>
                                                
                                            </Box>
                                        </Grid>
                                    );
                                })}
                                                         </Grid>
                             <Box display="flex" justifyContent="center" marginTop="0.5rem">
                                 <Typography 
                                     style={{ 
                                         fontSize: '0.8rem', 
                                         color: theme.palette.text.secondary,
                                         fontWeight: 500
                                     }}
                                 >
                                     Unit: {unit}
                                 </Typography>
                             </Box>
                         </CardContent>
                     </Card>
                </Grid>
                );
            })}
        </Grid>
    );
}; 