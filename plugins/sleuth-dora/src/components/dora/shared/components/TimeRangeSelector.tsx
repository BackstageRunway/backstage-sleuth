import { makeStyles } from '@material-ui/core/styles';
import { Chip } from '@material-ui/core';
import { TimeRange } from '../../common/types/metrics';

const useStyles = makeStyles({
    container: {
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'center',
    },
    chip: {
        marginRight: '0.5rem',
        cursor: 'pointer',
        '&:last-child': {
            marginRight: 0,
        },
    },
});



type Props = {
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
};

export function TimeRangeSelector({ selectedRange, onRangeChange }: Props) {
    const classes = useStyles();

    const timeRanges: TimeRange[] = ['last7days', 'last14days', 'last28days', 'last90days'];

    const handleChipClick = (range: TimeRange) => (event: React.MouseEvent) => {
        event.preventDefault();
        onRangeChange(range);
    };

    return (
        <div className={classes.container}>
            {timeRanges.map((range) => (
                <Chip
                    key={range}
                    label={range.replace('last', 'Last ').replace('days', ' Days')}
                    onClick={handleChipClick(range)}
                    color={selectedRange === range ? 'primary' : 'default'}
                    className={classes.chip}
                    clickable
                />
            ))}
        </div>
    );
} 