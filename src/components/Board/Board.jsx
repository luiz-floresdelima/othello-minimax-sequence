import styles from "./Board.module.scss"

export function Board({children}){
    return (
        <div className={styles.container}>
            {children}
        </div>
    )
}