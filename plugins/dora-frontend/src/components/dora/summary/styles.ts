import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
    container: {
        padding: '1rem',
    },
    error: {
        marginBottom: '1rem',
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
    },
    cardContent: {
        flexGrow: 1,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
    },
    metricHeader: {
        marginBottom: '1rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    metricName: {
        color: 'rgba(0, 0, 0, 0.87)',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        fontSize: '1rem',
    },
    metricValue: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'rgba(0, 0, 0, 0.87)',
        textAlign: 'center',
        lineHeight: 1.1,
        marginBottom: '0.25rem',
    },
    metricInfo: {
        marginTop: '0.75rem',
        fontSize: '0.875rem',
        color: 'rgba(0, 0, 0, 0.6)',
        textAlign: 'center',
    },
    targetValue: {
        fontWeight: 500,
        color: 'rgba(0, 0, 0, 0.87)',
    },
    divider: {
        margin: '1rem 0',
    },
    insightsList: {
        marginTop: '0.75rem',
        padding: 0,
    },
    insightItem: {
        padding: '0.5rem 0',
    },
    insightIcon: {
        minWidth: '32px',
    },
    goodInsight: {
        color: '#4caf50',
    },
    warningInsight: {
        color: '#ff9800',
    },
    criticalInsight: {
        color: '#f44336',
    },
    infoIcon: {
        fontSize: '1rem',
        color: 'rgba(0, 0, 0, 0.54)',
        cursor: 'help',
    },
}); 