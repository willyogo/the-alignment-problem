export function SpreadsheetArtifact({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (<div className="spreadsheet-artifact my-8"><table><thead><tr>{columns.map((col, i) => <th key={i}>{col}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>);
}
