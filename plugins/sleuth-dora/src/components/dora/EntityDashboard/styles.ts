import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
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
        display: 'flex',
        height: '340px',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        transition: 'all 0.2s ease-in-out',
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
    },
    metricHeader: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '0.25rem',
    },
    metricName: {
        fontSize: '1.1rem',
        color: theme.palette.text.secondary,
    },
    metricValue: {
        fontSize: '1.8rem',
        fontWeight: 600,
        color: theme.palette.text.primary,
        marginBottom: '0.25rem',
    },
    metricInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '0.125rem',
    },
    trendRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    trendCaption: {
        fontSize: '0.75rem',
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    targetValue: {
        fontSize: '0.875rem',
        color: theme.palette.text.secondary,
    },
    divider: {
        width: '100%',
        margin: '1rem 0',
    },
    insightsList: {
        padding: 0,
        width: '100%',
        '& .MuiListItemText-root': {
            margin: 0,
            '& .MuiTypography-root': {
                fontSize: '0.875rem',
            },
        },
    },
    insightItem: {
        padding: '0.25rem 0',
    },
    insightIcon: {
        minWidth: '2rem',
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
        marginRight: '0.5rem',
    },
    trendUp: {
        color: '#4caf50',
    },
    trendDown: {
        color: '#f44336',
    },
}));
