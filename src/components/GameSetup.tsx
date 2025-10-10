interface GameSetupProps {
  playersPerTeam: number[];
  endsCount: number;
  playerNames: string[];
  teamNames: string[];
  handicaps: Record<string, number>;
  onPlayersPerTeamChange: (playersPerTeam: number[]) => void;
  onEndsCountChange: (count: number) => void;
  onPlayerNameChange: (index: number, name: string) => void;
  onTeamNameChange: (index: number, name: string) => void;
  onHandicapChange: (key: string, value: number) => void;
}

export function GameSetup({
  playersPerTeam,
  endsCount,
  playerNames,
  teamNames,
  handicaps,
  onPlayersPerTeamChange,
  onEndsCountChange,
  onPlayerNameChange,
  onTeamNameChange,
  onHandicapChange,
}: GameSetupProps) {
  const handleTeam1PlayersChange = (count: number) => {
    onPlayersPerTeamChange([count, playersPerTeam[1] || 1]);
  };

  const handleTeam2PlayersChange = (count: number) => {
    onPlayersPerTeamChange([playersPerTeam[0] || 1, count]);
  };

  const getPlayerIndex = (teamIndex: number, playerIndex: number) => {
    if (teamIndex === 0) {
      return playerIndex;
    } else {
      return playersPerTeam[0] + playerIndex;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Ends
        </label>
        <select
          value={endsCount}
          onChange={(e) => onEndsCountChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'End' : 'Ends'}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Team 1</h3>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Players
          </label>
          <select
            value={playersPerTeam[0] || 1}
            onChange={(e) => handleTeam1PlayersChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Player' : 'Players'}
              </option>
            ))}
          </select>
        </div>

        {Array.from({ length: playersPerTeam[0] || 1 }, (_, i) => (
          <div key={i} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player {i + 1} Name
            </label>
            <input
              type="text"
              value={playerNames[getPlayerIndex(0, i)] || ''}
              onChange={(e) => onPlayerNameChange(getPlayerIndex(0, i), e.target.value)}
              placeholder={`Enter player ${i + 1} name`}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team 1 Name
          </label>
          <input
            type="text"
            value={teamNames[0] || ''}
            onChange={(e) => onTeamNameChange(0, e.target.value)}
            placeholder="Enter team name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team 1 Handicap
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={handicaps['team1'] || 0}
            onChange={(e) => onHandicapChange('team1', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Team 2</h3>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Players
          </label>
          <select
            value={playersPerTeam[1] || 1}
            onChange={(e) => handleTeam2PlayersChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Player' : 'Players'}
              </option>
            ))}
          </select>
        </div>

        {Array.from({ length: playersPerTeam[1] || 1 }, (_, i) => (
          <div key={i} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player {i + 1} Name
            </label>
            <input
              type="text"
              value={playerNames[getPlayerIndex(1, i)] || ''}
              onChange={(e) => onPlayerNameChange(getPlayerIndex(1, i), e.target.value)}
              placeholder={`Enter player ${i + 1} name`}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team 2 Name
          </label>
          <input
            type="text"
            value={teamNames[1] || ''}
            onChange={(e) => onTeamNameChange(1, e.target.value)}
            placeholder="Enter team name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team 2 Handicap
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={handicaps['team2'] || 0}
            onChange={(e) => onHandicapChange('team2', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
}
