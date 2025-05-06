import CallMadeIcon from '@material-ui/icons/CallMade';
import { toMaxLimit } from '../../DORAMetricModel';

type TrendType = 'ailing' | 'neutral' | 'improving';

interface PerformanceTrendIndicatorProps {
    width: number;
    metricName: string;
    percentageChange: number;
    trend: TrendType;
}

const PerformanceTrendIndicator: React.FC<PerformanceTrendIndicatorProps> = ({
    width,
    metricName,
    percentageChange,
    trend,
}) => {
    const containerStyle: React.CSSProperties = {
        width: `${width}%`,
        position: 'relative',
        paddingLeft: '5px',
        paddingRight: '5px',
        fontSize: '9px',
    };

    const arrowContainerStyle: React.CSSProperties = {
        display: 'inline-block',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '10px'
    };

    const contentStyle: React.CSSProperties = {
        textAlign: 'center',
    };

    const trendColors: Record<TrendType, string> = {
        ailing: 'red',
        neutral: 'black',
        improving: 'green',
    };

    const arrowIconStyle: React.CSSProperties = {
        color: trendColors[trend],
        fontSize: '18px',
        paddingBottom: '1px',
    };

    console.log(metricName);
    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                ({toMaxLimit(Math.round(percentageChange))}%)
                <div style={arrowContainerStyle}>
                    <CallMadeIcon style={arrowIconStyle} />
                </div>
            </div>
        </div>
    );
};

export default PerformanceTrendIndicator;