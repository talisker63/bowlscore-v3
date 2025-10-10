export async function generateScorecardJPEG(
  playersPerTeam: number[],
  endsCount: number,
  playerNames: string[],
  teamNames: string[],
  handicaps: Record<string, number>,
  scores: number[][],
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const padding = 30;
  const headerHeight = 130;
  const columnHeaderHeight = 50;
  const rowHeight = 45;
  const totalRowHeight = 60;
  const resultHeight = 70;
  const dateHeight = 30;
  const footerHeight = 40;

  const endCol = 80;
  const team1Col = 140;
  const team2Col = 140;
  const canvasWidth = endCol + team1Col + team2Col + padding * 2;

  canvas.width = canvasWidth;
  canvas.height = headerHeight + columnHeaderHeight + (endsCount * rowHeight) + totalRowHeight + resultHeight + dateHeight + footerHeight;

  ctx.fillStyle = '#f0f4f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#2d5016';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Lawn Bowls Score Card', canvas.width / 2, padding + 35);

  ctx.font = '11px Arial, sans-serif';
  ctx.fillStyle = '#555';
  const subtitleLines = [
    'You only need to login if you wish to store',
    'the results or email the card.',
  ];
  subtitleLines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, padding + 55 + i * 14);
  });

  const team1Name = teamNames[0] || 'Team 1';
  const team2Name = teamNames[1] || 'Team 2';

  const tableTop = headerHeight;
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(padding, tableTop, canvasWidth - padding * 2, columnHeaderHeight);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText('End', padding + endCol / 2, tableTop + columnHeaderHeight / 2);
  ctx.fillText(team1Name, padding + endCol + team1Col / 2, tableTop + columnHeaderHeight / 2);
  ctx.fillText(team2Name, padding + endCol + team1Col + team2Col / 2, tableTop + columnHeaderHeight / 2);

  const getRunningTotal = (teamIndex: number, upToEnd: number) => {
    const endScores = scores[teamIndex]?.slice(0, upToEnd + 1) || [];
    const total = endScores.reduce((sum, score) => sum + score, 0);
    const handicap = handicaps[`team${teamIndex + 1}`] || 0;
    return total - handicap;
  };

  for (let endIndex = 0; endIndex < endsCount; endIndex++) {
    const y = tableTop + columnHeaderHeight + (endIndex * rowHeight);
    ctx.fillStyle = endIndex % 2 === 0 ? '#e8f5e8' : '#fff';
    ctx.fillRect(padding, y, canvasWidth - padding * 2, rowHeight);

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, y, canvasWidth - padding * 2, rowHeight);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(endIndex + 1), padding + endCol / 2, y + rowHeight / 2);

    const team1Score = scores[0]?.[endIndex] ?? 0;
    const team2Score = scores[1]?.[endIndex] ?? 0;
    const team1Running = getRunningTotal(0, endIndex);
    const team2Running = getRunningTotal(1, endIndex);

    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(`${team1Score}`, padding + endCol + 30, y + rowHeight / 2);
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(`(${team1Running})`, padding + endCol + team1Col - 30, y + rowHeight / 2);

    ctx.font = '18px Arial, sans-serif';
    ctx.fillText(`${team2Score}`, padding + endCol + team1Col + 30, y + rowHeight / 2);
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(`(${team2Running})`, padding + endCol + team1Col + team2Col - 30, y + rowHeight / 2);
  }

  const team1Total = (scores[0]?.reduce((sum, score) => sum + score, 0) || 0) - (handicaps['team1'] || 0);
  const team2Total = (scores[1]?.reduce((sum, score) => sum + score, 0) || 0) - (handicaps['team2'] || 0);

  const totalY = tableTop + columnHeaderHeight + (endsCount * rowHeight);
  ctx.fillStyle = '#c7e6c7';
  ctx.fillRect(padding, totalY, canvasWidth - padding * 2, totalRowHeight);

  ctx.strokeStyle = '#2d5016';
  ctx.lineWidth = 2;
  ctx.strokeRect(padding, totalY, canvasWidth - padding * 2, totalRowHeight);

  ctx.fillStyle = '#2d5016';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Total', padding + endCol / 2, totalY + totalRowHeight / 2);
  ctx.fillText(String(team1Total), padding + endCol + team1Col / 2, totalY + totalRowHeight / 2);
  ctx.fillText(String(team2Total), padding + endCol + team1Col + team2Col / 2, totalY + totalRowHeight / 2);

  const resultY = totalY + totalRowHeight;
  ctx.fillStyle = '#e8f5e8';
  ctx.fillRect(padding, resultY, canvasWidth - padding * 2, resultHeight);

  ctx.fillStyle = '#2d5016';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  let resultText = '';
  if (team1Total > team2Total) {
    resultText = `Winner: ${team1Name} (${team1Total} - ${team2Total})`;
  } else if (team2Total > team1Total) {
    resultText = `Winner: ${team2Name} (${team2Total} - ${team1Total})`;
  } else if (team1Total === 0 && team2Total === 0) {
    resultText = 'No scores entered yet';
  } else {
    resultText = `Tie (${team1Total} - ${team2Total})`;
  }
  ctx.fillText(resultText, canvas.width / 2, resultY + resultHeight / 2);

  const dateY = resultY + resultHeight + dateHeight / 2;
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  ctx.fillStyle = '#555';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText(`Date Played: ${dateString}`, canvas.width / 2, dateY);

  const copyrightY = canvas.height - footerHeight / 2;
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('© Copyright Andrew Sleight 2025', canvas.width / 2, copyrightY);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate JPEG'));
    }, 'image/jpeg', 0.95);
  });
}

export function downloadJPEG(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
