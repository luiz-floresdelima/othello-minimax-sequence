import styles from "./Piece.module.scss";

export function Piece({ color }) {
  return <div className={`${styles.piece} ${styles[`piece-${color}`]}`}></div>;
}
