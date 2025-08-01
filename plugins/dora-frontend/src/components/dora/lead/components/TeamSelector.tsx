import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  makeStyles 
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useUserTeams, TeamInfo } from '../../hooks/useUserTeams';

const useStyles = makeStyles({
  container: {
    marginBottom: '1rem',
    minWidth: 200,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
  },
});

interface TeamSelectorProps {
  selectedTeam: string | null;
  onTeamChange: (team: string | null) => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({ 
  selectedTeam, 
  onTeamChange 
}) => {
  const classes = useStyles();
  const { teams, loading, error } = useUserTeams();

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className={classes.container}>
        {error}
      </Alert>
    );
  }

  if (teams.length === 0) {
    return (
      <Alert severity="warning" className={classes.container}>
        No teams found for the current user. Please check your entity relations.
      </Alert>
    );
  }

  return (
    <FormControl className={classes.container}>
      <InputLabel id="team-selector-label">Select Team</InputLabel>
      <Select
        labelId="team-selector-label"
        value={selectedTeam || ''}
        onChange={(event) => onTeamChange(event.target.value as string || null)}
        label="Select Team"
      >
        <MenuItem value="">
          <em>All Teams</em>
        </MenuItem>
        {teams.map((team: string) => (
          <MenuItem key={team} value={team}>
            {team}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 