import React, { useEffect, useState } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore instance
import { throttle } from 'lodash'; // Use lodash throttle to limit UI updates
import './BingoBoard.css'; // Import CSS file to style the board

const BoardPage = () => {
  const { roomId } = useParams();
  const [tasks, setTasks] = useState([]);
  const currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));

  useEffect(() => {
    const roomDocRef = doc(db, 'rooms', roomId);

    // Throttle UI updates (e.g., only update every 2 seconds)
    const throttledSetTasks = throttle((newTasks) => {
      setTasks(newTasks);
    }, 2000); // Adjust throttle time as necessary

    // Real-time listener for the tasks
    const unsubscribe = onSnapshot(roomDocRef, (doc) => {
      if (doc.exists()) {
        const roomData = doc.data();
        throttledSetTasks(roomData.tasks); // Throttle updates to tasks
      }
    });

    return () => unsubscribe(); // Clean up listener when component unmounts
  }, [roomId]);

  // Function to handle clicking on a task
  const handleTaskClick = async (index) => {
    // Use the existing tasks state to avoid redundant reads
    const updatedTasks = [...tasks];

    const task = updatedTasks[index];

    // Toggle the task state
    if (task.completedBy) {
      updatedTasks[index] = { ...task, completedBy: null, color: null }; // Unmark task
    } else {
      updatedTasks[index] = { ...task, completedBy: currentPlayer.nickname, color: currentPlayer.color }; // Mark task
    }

    // Update Firestore with the new task state
    const roomDocRef = doc(db, 'rooms', roomId);
    await updateDoc(roomDocRef, {
      tasks: updatedTasks,
    });

    // Optimistically update the local state to reflect changes immediately
    setTasks(updatedTasks);
  };

  return (
    <div className="board">
      <h2 className='board-title'>Bingo Board</h2>
      <div className="grid">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="task-square"
            onClick={() => handleTaskClick(index)}
            style={{ backgroundColor: task.color || 'white' }}
          >
            <p className="task-description">{task.description}</p>
            {task.completedBy && (
              <p className="completed-by">Completed by: {task.completedBy}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardPage;
