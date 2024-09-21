// src/Board.js
import React from 'react';
import './Board.css'; // Create a CSS file to style the board

const Board = ({ tasks }) => {
  // Helper function to chunk tasks into rows
  const chunkTasks = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const taskRows = chunkTasks(tasks, 5); // Break into 5x5 rows

  return (
    <div className="board">
      {taskRows.map((row, rowIndex) => (
        <div className="row" key={rowIndex}>
          {row.map((task, taskIndex) => (
            <div className="cell" key={taskIndex}>
              <p>{task.description}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
