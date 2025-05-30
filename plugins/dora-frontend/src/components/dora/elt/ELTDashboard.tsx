import { makeStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography } from '@material-ui/core';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { ProjectHealth } from './components/ProjectHealth';
import { TeamPerformance } from './components/TeamPerformance';
import { KeyMetrics } from './components/KeyMetrics';


const useStyles = makeStyles({
    container: {
        padding: '1rem',
    },
    paper: {
        padding: '1rem',
        marginBottom: '1rem',
    },
    title: {
        marginBottom: '1rem',
        fontSize: '1.25rem',
        fontWeight: 500,
    },
});

export const ELTDashboard = () => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Executive Dashboard</Typography>
                        <ExecutiveSummary />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Project Health</Typography>
                        <ProjectHealth />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Team Performance</Typography>
                        <TeamPerformance />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography className={classes.title}>Key Metrics</Typography>
                        <KeyMetrics />
                    </Paper>
                </Grid>

            </Grid>
        </div>
    );
}; 