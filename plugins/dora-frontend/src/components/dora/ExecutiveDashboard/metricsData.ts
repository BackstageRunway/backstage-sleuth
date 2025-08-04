export const projects = [
    {
        name: 'Sleuth',
        metrics: {
            frequency: { value: 2.19, trend: 'up', change: '32%' },
            leadTime: { value: 23.5, trend: 'down', change: '15%' },
            failureRate: { value: 1.2, trend: 'down', change: '-0.3%' },
            mttr: { value: 2.5, trend: 'up', change: '0.5%' },
        },
        color: '#2ecc71',
    },
    {
        name: 'Sleuth Clients',
        metrics: {
            frequency: { value: 1.8, trend: 'up', change: '25%' },
            leadTime: { value: 18.5, trend: 'down', change: '10%' },
            failureRate: { value: 2.0, trend: 'up', change: '0.2%' },
            mttr: { value: 3.1, trend: 'down', change: '-0.2%' },
        },
        color: '#3498db',
    },
    {
        name: 'Sleuth Website',
        metrics: {
            frequency: { value: 1.5, trend: 'up', change: '20%' },
            leadTime: { value: 30.0, trend: 'up', change: '5%' },
            failureRate: { value: 0.8, trend: 'stable', change: '0%' },
            mttr: { value: 1.7, trend: 'stable', change: '0%' },
        },
        color: '#9b59b6',
    },
]; 