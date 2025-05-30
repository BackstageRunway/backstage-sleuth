import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Box, LinearProgress } from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

const useStyles = makeStyles({
    teamCard: {
        padding: '1rem',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        marginBottom: '1rem',
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

    const teams = [
        {
            name: 'Backend',
            metrics: {
                deploymentFrequency: '2.5/day',
                leadTime: '16.2h',
                failureRate: '0%',
                mttr: '0h',
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
                failureRate: '0%',
                mttr: '0h',
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
                failureRate: '0%',
                mttr: '0h',
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
                failureRate: '0%',
                mttr: '0h',
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
                failureRate: '0%',
                mttr: '0h',
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
                failureRate: '0%',
                mttr: '0h',
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
                failureRate: '0%',
                mttr: '0h',
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
                failureRate: '0%',
                mttr: '0h',
                collaborationScore: 82,
                resourceUtilization: 85,
            },
            trend: 'stable',
        },
    ];

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUpIcon className={classes.improving} />;
            case 'down':
                return <TrendingDownIcon className={classes.ailing} />;
            default:
                return <TrendingFlatIcon className={classes.neutral} />;
        }
    };

    return (
        <Grid container spacing={2}>
            {teams.map((team) => (
                <Grid item xs={12} key={team.name}>
                    <Box className={classes.teamCard}>
                        <Box className={classes.teamHeader}>
                            <Typography className={classes.teamName}>
                                {team.name}
                            </Typography>
                            {getTrendIcon(team.trend)}
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box className={classes.metricContainer}>
                                    <Typography className={classes.metricLabel}>
                                        Collaboration Score
                                    </Typography>
                                    <Box className={classes.collaborationScore}>
                                        <Typography className={classes.metricValue}>
                                            {team.metrics.collaborationScore}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={team.metrics.collaborationScore}
                                            className={classes.progressBar}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box className={classes.metricContainer}>
                                    <Typography className={classes.metricLabel}>
                                        Resource Utilization
                                    </Typography>
                                    <Box className={classes.collaborationScore}>
                                        <Typography className={classes.metricValue}>
                                            {team.metrics.resourceUtilization}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={team.metrics.resourceUtilization}
                                            className={classes.progressBar}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box className={classes.metricContainer}>
                                    <Typography className={classes.metricLabel}>
                                        Deployment Frequency
                                    </Typography>
                                    <Typography className={classes.metricValue}>
                                        {team.metrics.deploymentFrequency}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box className={classes.metricContainer}>
                                    <Typography className={classes.metricLabel}>
                                        Lead Time
                                    </Typography>
                                    <Typography className={classes.metricValue}>
                                        {team.metrics.leadTime}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box className={classes.metricContainer}>
                                    <Typography className={classes.metricLabel}>
                                        Failure Rate
                                    </Typography>
                                    <Typography className={classes.metricValue}>
                                        {team.metrics.failureRate}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box className={classes.metricContainer}>
                                    <Typography className={classes.metricLabel}>
                                        MTTR
                                    </Typography>
                                    <Typography className={classes.metricValue}>
                                        {team.metrics.mttr}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
}; 