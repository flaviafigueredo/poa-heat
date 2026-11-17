import styles from "./DataTable.module.css";

type DataTableProps = {
  summary: string;
  caption: string;
  columns: string[];
  rows: { key: string | number; cells: string[] }[];
};

// Tabela com os números do gráfico, fechada por padrão. Serve para quem usa
// leitor de tela e para quem prefere ler os valores exatos. A primeira coluna
// identifica a linha (por exemplo, o ano).
export function DataTable({ summary, caption, columns, rows }: DataTableProps) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>{summary}</summary>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                {row.cells.map((cell, index) =>
                  index === 0 ? (
                    <th key={index} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={index}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
