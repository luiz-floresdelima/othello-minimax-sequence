import styles from "./Cell.module.scss";

export function Cell({ children, handleCellClick, idx, highlight, board }) {
  return (
    <div
      className={`${styles.cell} ${highlight ? styles.highlight : ""}`}
      onClick={() => handleCellClick(board, idx)}
    >
      {children}
    </div>
  );
}
