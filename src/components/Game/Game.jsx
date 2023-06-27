import { Board } from "../Board/Board";
import { Cell } from "../Cell/Cell";
import { Piece } from "../Piece/Piece";
import { useState, useEffect, useCallback } from "react";

export function Game() {
  let auxBoard = Array.from(Array(8), () => Array(8).fill(null));
  auxBoard[3][3] = 2;
  auxBoard[3][4] = 1;
  auxBoard[4][3] = 1;
  auxBoard[4][4] = 2;

  const player1 = {
    codigo: 1,
    color: "black",
  };

  const player2 = {
    codigo: 2,
    color: "white",
  };

  const [board, setBoard] = useState(auxBoard);

  const [player, setPlayer] = useState(player1);
  const [winner, setWinner] = useState(null);

  const getFlipCellsOnMove = useCallback(
    (board, idx) => {
      let count = 0;
      const x = idx[0];
      const y = idx[1];
      if (board[x][y] !== null) {
        return count;
      }
      for (let deltaY = -1; deltaY <= 1; deltaY++) {
        for (let deltaX = -1; deltaX <= 1; deltaX++) {
          for (let distance = 1; ; distance++) {
            const posX = x + distance * deltaX;
            const posY = y + distance * deltaY;
            if (posX < 0 || posX >= 8 || posY < 0 || posY >= 8) {
              break;
            }
            if (board[posX][posY] === null) {
              break;
            }

            if (board[posX][posY] === player.codigo) {
              count += distance - 1;
              break;
            }
          }
        }
      }
      return count;
    },
    [board]
  );

  const checkPossibleMoves = useCallback(
    (board) => {
      const possibleMoves = [];

      const boardSize = 8;
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          if (getFlipCellsOnMove(board, [x, y]) > 0) {
            possibleMoves.push([x, y]);
          }
        }
      }

      return possibleMoves;
    },
    [board]
  );

  const [possibleMoves, setPossibleMoves] = useState(checkPossibleMoves(board));

  const makeMove = useCallback(
    (board, idxs, isMinimax, player) => {
      const x = idxs[0];
      const y = idxs[1];
      const auxBoard = [...board];
      auxBoard[x][y] = player.codigo;

      for (let deltaY = -1; deltaY <= 1; deltaY++) {
        for (let deltaX = -1; deltaX <= 1; deltaX++) {
          for (let distance = 1; ; distance++) {
            let posX = x + distance * deltaX;
            let posY = y + distance * deltaY;

            if (posX < 0 || posX >= 8 || posY < 0 || posY >= 8) {
              break;
            }

            if (auxBoard[posX][posY] === null) {
              break;
            }

            if (auxBoard[posX][posY] === player.codigo) {
              for (distance -= 1; distance > 0; distance--) {
                posX = x + distance * deltaX;
                posY = y + distance * deltaY;
                auxBoard[posX][posY] = player.codigo;
              }
              break;
            }
          }
        }
      }
      if (!isMinimax) {
        setBoard(auxBoard);
      }
    },
    [board, player]
  );

  const handleCellClick = useCallback(
    (board, idx) => {
      const idxX = idx[0];
      const idxY = idx[1];
      if (!board[idxX][idxY]) {
        if (possibleMoves.some((el) => el[0] == idxX && el[1] == idxY)) {
          makeMove(board, [idxX, idxY], false, player);
          setPlayer(player.codigo == player1.codigo ? player2 : player1);
        } else {
          console.error("Movimento não permitido!");
        }
      } else {
        console.error("Célula já ocupada!");
      }
    },
    [board, possibleMoves]
  );

  const getPoints = useCallback((player, board) => {
    return board.flat(1).filter((el) => el === player).length;
  }, []);

  const evaluate = useCallback((board) => {
    const enemyPoints = getPoints(player2.codigo, board);
    const playerPoints = getPoints(player1.codigo, board);
    return enemyPoints - playerPoints;
  }, []);

  const minimax = (board, depth, maximizingPlayer) => {
    if (depth === 0) {
      return evaluate(board);
    }

    const possibleMoves = checkPossibleMoves(board);

    if (maximizingPlayer) {
      let maxScore = -Infinity;

      for (const move of possibleMoves) {
        const aux = generateCopyBoard(board);
        makeMove(aux, move, true, player1);
        const newBoard = [...aux];

        // Recursively call minimax with the new board and the opponent as the maximizing player
        const score = minimax(newBoard, depth - 1, false);

        // Update the maxScore if a higher score is found
        maxScore = Math.max(maxScore, score);
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (const move of possibleMoves) {
        const aux = generateCopyBoard(board);
        makeMove(aux, move, true, player2);
        const newBoard = [...aux];

        // Recursively call minimax with the new board and the opponent as the maximizing player
        const score = minimax(newBoard, depth - 1, true);

        // Update the minScore if a lower score is found
        minScore = Math.min(minScore, score);
      }

      return minScore;
    }
  };

  function getBestMove(depth) {
    let bestScore = -Infinity;
    let bestMove;

    const possibleMoves = checkPossibleMoves(board);
    for (const move of possibleMoves) {
      const aux = generateCopyBoard(board);
      makeMove(aux, move, true, player2);
      const newBoard = [...aux];
      const score = minimax([...newBoard], depth - 1, true);
      console.log({move,score})
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  const generateCopyBoard = (board) => {
    const auxBoard = board.map((arr) => [...arr]);
    return [...auxBoard];
  };

  useEffect(() => {
    setPossibleMoves(checkPossibleMoves(board));
  }, [board]);

  useEffect(() => {
    if (possibleMoves.length == 0) {
      setPlayer(player.codigo == player1.codigo ? player2 : player1);
    }
  }, [possibleMoves]);

  useEffect(() => {
    if (checkPossibleMoves(board).length > 0) {
      if (player.codigo == 2) {
        let start = performance.now();
        makeMove(board, getBestMove(7), false, player);
        let timeTaken = performance.now() - start;
        console.log("Total time taken : " + timeTaken + " milliseconds");
        setPlayer(player.codigo == player1.codigo ? player2 : player1);
      }
    } else {
      setPlayer(player.codigo == player1.codigo ? player2 : player1);
    }
  }, [player]);

  return (
    <>
      <div className="header">
        <h3>
          Turno do jogador {player.codigo}({player.color})
        </h3>
        <div className="scores">
          <p>Preto: {getPoints(1, board)}</p>
          <p>Branco: {getPoints(2, board)}</p>
        </div>
      </div>
      <Board>
        {board &&
          board.map((row, idx) => {
            return row.map((col, indx) => {
              return (
                <Cell
                  board={board}
                  key={`${idx}-${indx}`}
                  handleCellClick={handleCellClick}
                  highlight={
                    possibleMoves.some((el) => el[0] == idx && el[1] == indx)
                      ? true
                      : false
                  }
                  idx={[idx, indx]}
                >
                  {col == 1 && <Piece color="black" idxX={idx} idxY={indx} />}
                  {col == 2 && <Piece color="white" idxX={idx} idxY={indx} />}
                  {/* {idx} - {indx} */}
                </Cell>
              );
            });
          })}
      </Board>
    </>
  );
}
