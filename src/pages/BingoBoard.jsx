// src/BoardPage.jsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore instance
import './BingoBoard.css'; // Import CSS file to style the board

const BoardPage = () => {
  const { roomId } = useParams();
  const [tasks, setTasks] = useState([]);
  const currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));

  useEffect(() => {
    const roomDocRef = doc(db, 'rooms', roomId);

    // Real-time listener for the tasks
    const unsubscribe = onSnapshot(roomDocRef, (doc) => {
      if (doc.exists()) {
        const roomData = doc.data();
        setTasks(roomData.tasks); // Update the board with new task states
      }
    });

    return () => unsubscribe(); // Clean up listener when component unmounts
  }, [roomId]);

  const handleTaskClick = async (index) => {
    const roomDocRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomDocRef);
    const roomData = roomDoc.data();
    const updatedTasks = [...roomData.tasks]; // Copy current tasks

    const task = updatedTasks[index];
    
    // Toggle the task state: if already marked, reset it, otherwise mark with player's info
    if (task.completedBy) {
      // Unmark the task
      updatedTasks[index] = { ...task, completedBy: null, color: null };
    } else {
      // Mark the task as completed by the current player
      updatedTasks[index] = { ...task, completedBy: currentPlayer.nickname, color: currentPlayer.color };
    }

    // Update Firestore with new task state
    await updateDoc(roomDocRef, {
      tasks: updatedTasks,
    });
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
