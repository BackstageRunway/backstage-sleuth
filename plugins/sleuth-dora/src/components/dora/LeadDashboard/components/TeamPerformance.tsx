import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Typography, Box, Card, CardContent, Fade, Chip, CircularProgress } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { TeamMetricsData } from '../hooks/useAllTeamsMetrics';
import { formatDuration } from '../../common/utils/formatters';

const useStyles = makeStyles(theme => ({
    teamCard: {
        padding: '1rem',
        borderRadius: '12px',
        // the light gradient would leave theme-coloured text unreadable in dark mode
        background: theme.palette.type === 'dark'
            ? theme.palette.background.default
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(44, 62, 80, 0.08)',
        transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
        '&:hover': {
            transform: 'translateY(-6px) scale(1.03)',
            boxShadow: '0 8px 24px rgba(44, 62, 80, 0.18)',
            background: theme.palette.type === 'dark'
                ? theme.palette.action.hover
                : 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
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
        color: theme.palette.text.secondary,
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
}));

interface TeamPerformanceProps {
    selectedTeam?: string | null;
    allTeamsData?: TeamMetricsData[];
    isLoading?: boolean;
}

export const TeamPerformance = ({ selectedTeam, allTeamsData, isLoading = false }: TeamPerformanceProps) => {
    const classes = useStyles();
    const theme = useTheme();
    const [fadeIn, setFadeIn] = useState(false);
    useEffect(() => { setFadeIn(true); }, []);

    // Use provided data or fallback to empty array, and filter out invalid entries
    const allTeams = (allTeamsData || []).filter(team => team && team.name && team.metrics);

    // Filter teams based on selectedTeam
    const filteredTeams = selectedTeam 
        ? allTeams.filter(team => team.name === selectedTeam || team.name?.toLowerCase() === selectedTeam?.toLowerCase())
        : allTeams;



    // Sort teams so that declining teams appear first
    const sortedTeams = [...filteredTeams].sort((a, b) => {
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
    const AnimatedNumber = ({ value, color, fontSize = '1.5rem', fontWeight = 700, unit = '' }: { value: string, color: string, fontSize?: string, fontWeight?: number, unit?: string }) => {
        const [displayValue, setDisplayValue] = useState('0');
        useEffect(() => {
            const start = 0;
            const end = parseFloat(value);
            if (isNaN(end)) {
                setDisplayValue(value);
                return undefined;
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
        return (
            <span style={{ fontWeight, fontSize, color, display: 'inline-block', whiteSpace: 'nowrap' }}>
                {displayValue}{unit}
            </span>
        );
    };

    // Prepare data for team metrics donuts
    const colorPalette = [
        '#2ecc71', '#3498db', '#f1c40f', '#e67e22', '#9b59b6', '#e74c3c', '#1abc9c', '#34495e'
    ];
    
    // Helper function to safely parse metric values
    const safeParseFloat = (value: string, defaultValue: number = 0) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    };

    const deploymentDonutData = sortedTeams.map((team, idx) => ({
        name: team.name || 'Unknown Team',
        value: safeParseFloat(team.metrics.deploymentFrequency),
        color: colorPalette[idx % colorPalette.length],
    }));
    
    const leadTimeDonutData = sortedTeams.map((team, idx) => ({
        name: team.name || 'Unknown Team',
        value: team.raw.leadTimeSec,
        color: colorPalette[idx % colorPalette.length],
    }));
    
    const mttrDonutData = sortedTeams.map((team, idx) => ({
        name: team.name || 'Unknown Team',
        value: team.raw.mttrSec,
        color: colorPalette[idx % colorPalette.length],
    }));
    
    const failureRateDonutData = sortedTeams.map((team, idx) => ({
        name: team.name || 'Unknown Team',
        value: safeParseFloat(team.metrics.failureRate),
        color: colorPalette[idx % colorPalette.length],
    }));
    
    // Averaged, not summed: teams can share members, so their deployments overlap
    const avgDeployments = deploymentDonutData.length > 0 ? deploymentDonutData.reduce((sum, t) => sum + t.value, 0) / deploymentDonutData.length : 0;
    const avgLeadTime = leadTimeDonutData.length > 0 ? leadTimeDonutData.reduce((sum, t) => sum + t.value, 0) / leadTimeDonutData.length : 0;
    const avgMTTR = mttrDonutData.length > 0 ? mttrDonutData.reduce((sum, t) => sum + t.value, 0) / mttrDonutData.length : 0;
    const avgFailureRate = failureRateDonutData.length > 0 ? failureRateDonutData.reduce((sum, t) => sum + t.value, 0) / failureRateDonutData.length : 0;

    const donutCharts = [
        {
            title: 'Deployments',
            data: deploymentDonutData,
            center: `${avgDeployments.toFixed(2)}/day`,
            centerLabel: 'Avg Deployments',
            format: (value: number) => `${value.toFixed(2)}/day`,
        },
        {
            title: 'Lead Time',
            data: leadTimeDonutData,
            center: formatDuration(avgLeadTime),
            centerLabel: 'Avg Lead Time',
            format: formatDuration,
        },
        {
            title: 'MTTR',
            data: mttrDonutData,
            center: formatDuration(avgMTTR),
            centerLabel: 'Avg MTTR',
            format: formatDuration,
        },
        {
            title: 'Failure Rate',
            data: failureRateDonutData,
            center: `${avgFailureRate.toFixed(1)}%`,
            centerLabel: 'Avg Failure Rate',
            format: (value: number) => `${value.toFixed(1)}%`,
        },
    ];

    // Add a helper to determine if a team is declining
    const isDeclining = (trend: string) => trend === 'down';

    // Show loading state
    if (isLoading) {
        return (
            <Box textAlign="center" py={4}>
                <CircularProgress size={40} />
                <Typography variant="h6" color="textSecondary" style={{ marginTop: '1rem' }}>
                    Loading team performance data...
                </Typography>
            </Box>
        );
    }

    // Don't render if no valid data
    if (sortedTeams.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary">
                    {selectedTeam 
                        ? `No data available for team "${selectedTeam}"`
                        : 'No teams available'
                    }
                </Typography>
            </Box>
        );
    }

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
                                        isAnimationActive
                                        label={false}
                                    >
                                        {chart.data.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value, name, props) => {
                                        const teamName = name || props?.payload?.name || 'Unknown Team';
                                        return [chart.format(Number(value)), teamName];
                                    }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.7rem', color: theme.palette.text.primary, lineHeight: 1, whiteSpace: 'nowrap' }}>{chart.center}</span>
                                <Typography variant="caption" style={{ color: theme.palette.text.secondary, textAlign: 'center' }}>{chart.centerLabel}</Typography>
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
                        <Typography variant="body2" style={{ color: theme.palette.text.primary, fontSize: '1.05rem' }}>{team.name}</Typography>
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
                                    ? { border: '2px solid #e53935', boxShadow: '0 0 16px 2px rgba(229, 57, 53, 0.25)' }
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
                                                  <Typography variant="caption" className={classes.metricLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>
                                                      Deployment Frequency
                                                  </Typography>
                                                  <AnimatedNumber 
                                                      value={team.metrics.deploymentFrequency.replace('/day','')} 
                                                      color={theme.palette.text.primary} 
                                                      fontSize="2rem" 
                                                      unit="/day"
                                                  />
                                              </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                              <Box>
                                                  <Typography variant="caption" className={classes.metricLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>
                                                      Lead Time
                                                  </Typography>
                                                  <span style={{ fontWeight: 700, fontSize: '2rem', color: '#3498db', display: 'inline-block', whiteSpace: 'nowrap' }}>
                                                      {team.metrics.leadTime}
                                                  </span>
                                              </Box>
                                          </Grid>
                                      </Grid>
                                      {/* Reliability Metrics */}
                                      <Grid container spacing={2} style={{ marginBottom: 8 }}>
                                          <Grid item xs={6}>
                                              <Box>
                                                  <Typography variant="caption" className={classes.metricLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>
                                                      Failure Rate
                                                  </Typography>
                                                  <AnimatedNumber 
                                                      value={team.metrics.failureRate.replace('%','')} 
                                                      color="#e74c3c" 
                                                      fontSize="2rem" 
                                                      unit="%"
                                                  />
                                              </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                              <Box>
                                                  <Typography variant="caption" className={classes.metricLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>
                                                      MTTR
                                                  </Typography>
                                                  <span style={{ fontWeight: 700, fontSize: '2rem', color: '#f1c40f', display: 'inline-block', whiteSpace: 'nowrap' }}>
                                                      {team.metrics.mttr}
                                                  </span>
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