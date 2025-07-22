import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent, Fade, Chip } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const useStyles = makeStyles({
    teamCard: {
        padding: '1rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(44, 62, 80, 0.08)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        '&:hover': {
            transform: 'translateY(-6px) scale(1.03)',
            boxShadow: '0 8px 24px rgba(44, 62, 80, 0.18)',
            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
        },
    },
    teamHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    teamName: {
        fontWeight: 500,
    },
    metricContainer: {
        marginTop: '0.5rem',
    },
    metricLabel: {
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: '0.875rem',
        marginBottom: '0.25rem',
    },
    metricValue: {
        fontWeight: 500,
    },
    progressBar: {
        height: '8px',
        borderRadius: '4px',
        marginTop: '0.25rem',
    },
    improving: {
        color: '#4caf50',
    },
    ailing: {
        color: '#f44336',
    },
    neutral: {
        color: '#9e9e9e',
    },
    collaborationScore: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
});

export const TeamPerformance = () => {
    const classes = useStyles();
    const [fadeIn, setFadeIn] = useState(false);
    useEffect(() => { setFadeIn(true); }, []);

    // const trendLabels: { [key: string]: string } = {
    //     up: 'Improving',
    //     down: 'Declining',
    //     stable: 'Stable',
    // };

    // const trendColors: { [key: string]: string } = {
    //     up: '#e8f5e9', // light green
    //     down: '#ffebee', // light red
    //     stable: '#f5f5f5', // neutral
    // };

    const teams = [
        {
            name: 'Backend',
            metrics: {
                deploymentFrequency: '2.5/day',
                leadTime: '16.2h',
                failureRate: '1.2%',
                mttr: '2.5h',
                collaborationScore: 85,
                resourceUtilization: 92,
            },
            trend: 'up',
        },
        {
            name: 'Frontend',
            metrics: {
                deploymentFrequency: '1.8/day',
                leadTime: '20.5h',
                failureRate: '2.0%',
                mttr: '3.1h',
                collaborationScore: 78,
                resourceUtilization: 88,
            },
            trend: 'stable',
        },
        {
            name: 'SRE',
            metrics: {
                deploymentFrequency: '1.2/day',
                leadTime: '28.5h',
                failureRate: '0.8%',
                mttr: '1.7h',
                collaborationScore: 92,
                resourceUtilization: 95,
            },
            trend: 'up',
        },
        {
            name: 'Product Dev',
            metrics: {
                deploymentFrequency: '0.8/day',
                leadTime: '32.5h',
                failureRate: '2.5%',
                mttr: '4.2h',
                collaborationScore: 75,
                resourceUtilization: 82,
            },
            trend: 'down',
        },
        {
            name: 'Platform',
            metrics: {
                deploymentFrequency: '1.5/day',
                leadTime: '22.5h',
                failureRate: '1.5%',
                mttr: '2.2h',
                collaborationScore: 88,
                resourceUtilization: 90,
            },
            trend: 'up',
        },
        {
            name: 'Infrastructure',
            metrics: {
                deploymentFrequency: '1.0/day',
                leadTime: '26.5h',
                failureRate: '1.7%',
                mttr: '2.9h',
                collaborationScore: 90,
                resourceUtilization: 93,
            },
            trend: 'stable',
        },
        {
            name: 'Security',
            metrics: {
                deploymentFrequency: '0.5/day',
                leadTime: '30.5h',
                failureRate: '1.0%',
                mttr: '2.0h',
                collaborationScore: 85,
                resourceUtilization: 87,
            },
            trend: 'up',
        },
        {
            name: 'Quality Assurance',
            metrics: {
                deploymentFrequency: '0.3/day',
                leadTime: '35.5h',
                failureRate: '1.3%',
                mttr: '2.7h',
                collaborationScore: 82,
                resourceUtilization: 85,
            },
            trend: 'stable',
        },
    ];

    // Sort teams so that declining teams appear first
    const sortedTeams = [...teams].sort((a, b) => {
        if (a.trend === 'down' && b.trend !== 'down') return -1;
        if (a.trend !== 'down' && b.trend === 'down') return 1;
        return 0;
    });

    const getTrendChip = (trend: string) => {
        switch (trend) {
            case 'up':
                return <Chip label="Improving" icon={<TrendingUpIcon style={{ color: '#fff' }} />} style={{ backgroundColor: '#43a047', color: '#fff', fontWeight: 600, marginLeft: 8 }} size="small" />;
            case 'down':
                return <Chip label="Declining" icon={<TrendingDownIcon style={{ color: '#fff' }} />} style={{ backgroundColor: '#e53935', color: '#fff', fontWeight: 600, marginLeft: 8 }} size="small" />;
            default:
                return <Chip label="Stable" icon={<TrendingFlatIcon style={{ color: '#fff' }} />} style={{ backgroundColor: '#607d8b', color: '#fff', fontWeight: 600, marginLeft: 8 }} size="small" />;
        }
    };

    // Helper for animated numbers
    const AnimatedNumber = ({ value, color, fontSize = '1.5rem', fontWeight = 700 }: { value: string, color: string, fontSize?: string, fontWeight?: number }) => {
        const [displayValue, setDisplayValue] = useState('0');
        useEffect(() => {
            let start = 0;
            const end = parseFloat(value);
            if (isNaN(end)) {
                setDisplayValue(value);
                return;
            }
            const duration = 800;
            const stepTime = 20;
            let current = start;
            const increment = (end - start) / (duration / stepTime);
            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                    setDisplayValue(end.toFixed(value.includes('.') ? 1 : 0));
                    clearInterval(timer);
                } else {
                    setDisplayValue(current.toFixed(value.includes('.') ? 1 : 0));
                }
            }, stepTime);
            return () => clearInterval(timer);
        }, [value]);
        return <Typography style={{ fontWeight, fontSize, color }}>{displayValue}{value.replace(/[-\d.]/g, '')}</Typography>;
    };

    // Prepare data for team metrics donuts
    const colorPalette = [
        '#2ecc71', '#3498db', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c', '#1abc9c', '#34495e'
    ];
    const deploymentDonutData = sortedTeams.map((team, idx) => ({
        name: team.name,
        value: parseFloat(team.metrics.deploymentFrequency),
        color: colorPalette[idx % colorPalette.length],
    }));
    const leadTimeDonutData = sortedTeams.map((team, idx) => ({
        name: team.name,
        value: parseFloat(team.metrics.leadTime),
        color: colorPalette[idx % colorPalette.length],
    }));
    const mttrDonutData = sortedTeams.map((team, idx) => ({
        name: team.name,
        value: parseFloat(team.metrics.mttr),
        color: colorPalette[idx % colorPalette.length],
    }));
    const failureRateDonutData = sortedTeams.map((team, idx) => ({
        name: team.name,
        value: parseFloat(team.metrics.failureRate),
        color: colorPalette[idx % colorPalette.length],
    }));
    const totalDeployments = deploymentDonutData.reduce((sum, t) => sum + t.value, 0);
    const avgLeadTime = leadTimeDonutData.reduce((sum, t) => sum + t.value, 0) / leadTimeDonutData.length;
    const avgMTTR = mttrDonutData.reduce((sum, t) => sum + t.value, 0) / mttrDonutData.length;
    const avgFailureRate = failureRateDonutData.reduce((sum, t) => sum + t.value, 0) / failureRateDonutData.length;

    const donutCharts = [
        {
            title: 'Deployments',
            data: deploymentDonutData,
            center: `${totalDeployments.toFixed(2)}/day`,
            centerLabel: 'Total Deployments',
            tooltipUnit: '/day',
        },
        {
            title: 'Lead Time',
            data: leadTimeDonutData,
            center: `${avgLeadTime.toFixed(1)}h`,
            centerLabel: 'Avg Lead Time',
            tooltipUnit: 'h',
        },
        {
            title: 'MTTR',
            data: mttrDonutData,
            center: `${avgMTTR.toFixed(1)}h`,
            centerLabel: 'Avg MTTR',
            tooltipUnit: 'h',
        },
        {
            title: 'Failure Rate',
            data: failureRateDonutData,
            center: `${avgFailureRate.toFixed(1)}%`,
            centerLabel: 'Avg Failure Rate',
            tooltipUnit: '%',
        },
    ];

    // Add a helper to determine if a team is declining
    const isDeclining = (trend: string) => trend === 'down';

    return (
        <>
            <Grid container spacing={3} style={{ marginBottom: 24 }}>
                {donutCharts.map((chart) => (
                    <Grid item xs={12} sm={6} md={3} key={chart.title}>
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" position="relative" style={{ height: 260 }}>
                            <ResponsiveContainer width={240} height={240}>
                                <PieChart>
                                    <Pie
                                        data={chart.data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        startAngle={90}
                                        endAngle={-270}
                                        isAnimationActive={true}
                                        label={false}
                                    >
                                        {chart.data.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
  formatter={(v, name) => [
    `${Number(v).toFixed(2)}${chart.tooltipUnit}`,
    name || ''
  ]}
/>
                                </PieChart>
                            </ResponsiveContainer>
                            <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <Typography style={{ fontWeight: 700, fontSize: '1.7rem', color: '#222', lineHeight: 1 }}>{chart.center}</Typography>
                                <Typography variant="caption" style={{ color: '#888', textAlign: 'center' }}>{chart.centerLabel}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            {/* Combined legend for all charts */}
            <Box mt={-2} mb={3} display="flex" flexWrap="wrap" justifyContent="center" alignItems="center">
                {sortedTeams.map((team, idx) => (
                    <Box key={team.name} display="flex" alignItems="center" mr={3} mb={1}>
                        <Box style={{ width: 18, height: 18, background: colorPalette[idx % colorPalette.length], borderRadius: 9, marginRight: 8 }} />
                        <Typography variant="body2" style={{ color: '#444', fontSize: '1.05rem' }}>{team.name}</Typography>
                    </Box>
                ))}
            </Box>
            <Grid container spacing={2}>
                {sortedTeams.map((team, idx) => (
                    <Fade in={fadeIn} style={{ transitionDelay: `${idx * 100}ms` }} key={team.name}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card
                                className={classes.teamCard}
                                elevation={isDeclining(team.trend) ? 8 : 0}
                                style={isDeclining(team.trend)
                                    ? { border: '2px solid #e53935', boxShadow: '0 0 16px 2px #ffebee' }
                                    : {}}
                            >
                                <CardContent>
                                    {/* Action warning for declining teams */}
                                    {isDeclining(team.trend) && (
                                        <Box mb={1} display="flex" alignItems="center" justifyContent="center">
                                            <Chip
                                                label="Take Action"
                                                icon={<TrendingDownIcon style={{ color: '#fff' }} />}
                                                style={{ backgroundColor: '#e53935', color: '#fff', fontWeight: 700, fontSize: '1rem' }}
                                                size="medium"
                                            />
                                            <Typography variant="caption" style={{ color: '#e53935', marginLeft: 8, fontWeight: 600 }}>
                                                This team's performance is declining. Investigate and take action!
                                            </Typography>
                                        </Box>
                                    )}
                                    {/* Card Header */}
                                    <Box className={classes.teamHeader} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography className={classes.teamName} style={{ fontSize: '1.25rem' }}>
                                            {team.name}
                                        </Typography>
                                        {getTrendChip(team.trend)}
                                    </Box>
                                    {/* Summary Row */}
                                    <Grid container spacing={2} style={{ marginBottom: 8 }}>
                                        <Grid item xs={6}>
                                            <Box>
                                                <Typography variant="caption" className={classes.metricLabel}>
                                                    Deployment Frequency
                                                </Typography>
                                                <AnimatedNumber value={team.metrics.deploymentFrequency.replace('/day','')} color="#2c3e50" fontSize="2rem" />
                                                <Typography variant="caption" style={{ color: '#2c3e50', marginLeft: 4 }}>/day</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box>
                                                <Typography variant="caption" className={classes.metricLabel}>
                                                    Lead Time
                                                </Typography>
                                                <AnimatedNumber value={team.metrics.leadTime.replace('h','')} color="#3498db" fontSize="2rem" />
                                                <Typography variant="caption" style={{ color: '#3498db', marginLeft: 4 }}>h</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    {/* Reliability Metrics */}
                                    <Grid container spacing={2} style={{ marginBottom: 8 }}>
                                        <Grid item xs={6}>
                                            <Box>
                                                <Typography variant="caption" className={classes.metricLabel}>
                                                    Failure Rate
                                                </Typography>
                                                <AnimatedNumber value={team.metrics.failureRate.replace('%','')} color="#e74c3c" fontSize="2rem" />
                                                <Typography variant="caption" style={{ color: '#e74c3c', marginLeft: 4 }}>%</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box>
                                                <Typography variant="caption" className={classes.metricLabel}>
                                                    MTTR
                                                </Typography>
                                                <AnimatedNumber value={team.metrics.mttr.replace('h','')} color="#f1c40f" fontSize="2rem" />
                                                <Typography variant="caption" style={{ color: '#f1c40f', marginLeft: 4 }}>h</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Fade>
                ))}
            </Grid>
        </>
    );
}; 