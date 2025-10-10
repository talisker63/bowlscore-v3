interface ScorecardProps {
  playersPerTeam: number[];
  endsCount: number;
  playerNames: string[];
  teamNames: string[];
  handicaps: Record<string, number>;
  scores: number[][];
  onScoresChange: (scores: number[][]) => void;
}

export function Scorecard({
  playersPerTeam,
  endsCount,
  playerNames,
  teamNames,
  handicaps,
  scores,
  onScoresChange,
}: ScorecardProps) {
  const getRunningTotal = (teamIndex: number, upToEnd: number) => {
    const endScores = scores[teamIndex]?.slice(0, upToEnd + 1) || [];
    const total = endScores.reduce((sum, score) => sum + score, 0);
    const handicap = handicaps[`team${teamIndex + 1}`] || 0;
    return total - handicap;
  };

  const getFinalTotal = (teamIndex: number) => {
    const scoreTotal = scores[teamIndex]?.reduce((sum, score) => sum + score, 0) || 0;
    const handicap = handicaps[`team${teamIndex + 1}`] || 0;
    return scoreTotal - handicap;
  };

  const handleScoreChange = (teamIndex: number, endIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);

    if (numValue < 0 || numValue > 8) return;

    const newScores = [...scores];
    if (!newScores[teamIndex]) {
      newScores[teamIndex] = Array(endsCount).fill(0);
    }
    newScores[teamIndex][endIndex] = numValue;

    const otherTeam = teamIndex === 0 ? 1 : 0;
    if (!newScores[otherTeam]) {
      newScores[otherTeam] = Array(endsCount).fill(0);
    }

    onScoresChange(newScores);
  };

  const team1Total = getFinalTotal(0);
  const team2Total = getFinalTotal(1);
  const team1Name = teamNames[0] || 'Team 1';
  const team2Name = teamNames[1] || 'Team 2';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-green-700 text-white p-4">
        <div className="grid grid-cols-3 gap-4 text-center font-semibold">
          <div>End</div>
          <div>{team1Name}</div>
          <div>{team2Name}</div>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {Array.from({ length: endsCount }, (_, endIndex) => {
          const team1Running = getRunningTotal(0, endIndex);
          const team2Running = getRunningTotal(1, endIndex);

          return (
            <div
              key={endIndex}
              className={`grid grid-cols-3 gap-4 p-3 border-b border-gray-200 ${
                endIndex % 2 === 0 ? 'bg-green-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-center font-bold text-gray-700">
                {endIndex + 1}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={scores[0]?.[endIndex] ?? 0}
                  onChange={(e) => handleScoreChange(0, endIndex, e.target.value)}
                  className="flex-1 px-3 py-2 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <div className="w-12 text-center font-semibold text-gray-700">
                  {team1Running}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={scores[1]?.[endIndex] ?? 0}
                  onChange={(e) => handleScoreChange(1, endIndex, e.target.value)}
                  className="flex-1 px-3 py-2 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <div className="w-12 text-center font-semibold text-gray-700">
                  {team2Running}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-green-100 p-4 border-t-2 border-green-700">
        <div className="grid grid-cols-3 gap-4 text-center font-bold text-lg">
          <div className="text-gray-700">Total</div>
          <div className="text-green-800">{team1Total}</div>
          <div className="text-green-800">{team2Total}</div>
        </div>
      </div>

      <div className="p-4 bg-green-50 border-t border-green-200">
        {team1Total > team2Total ? (
          <div className="text-center text-lg font-bold text-green-700">
            Winner: {team1Name} ({team1Total} - {team2Total})
          </div>
        ) : team2Total > team1Total ? (
          <div className="text-center text-lg font-bold text-green-700">
            Winner: {team2Name} ({team2Total} - {team1Total})
          </div>
        ) : team1Total === 0 && team2Total === 0 ? (
          <div className="text-center text-lg text-gray-500">
            No scores entered yet
          </div>
        ) : (
          <div className="text-center text-lg font-bold text-gray-700">
            Tie ({team1Total} - {team2Total})
          </div>
        )}
      </div>
    </div>
  );
}
