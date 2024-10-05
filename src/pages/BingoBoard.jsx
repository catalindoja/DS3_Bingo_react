import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore instance
import { getRandomTasks } from '../services/firebaseService'; // Import random tasks function
import './BingoBoard.css'; // Import CSS file to style the board
import throttle from 'lodash'; // Import lodash throttle to limit updates

const BoardPage = () => {
  const { roomId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [isModerator, setIsModerator] = useState(false); // Track if current user is moderator
  const [isObserver, setIsObserver] = useState(false); // Track if current user is observer
  const currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));
  
  // Get moderator ID from session if available
  const sessionModerator = JSON.parse(sessionStorage.getItem('moderatorId')) || null;

  useEffect(() => {
    const fetchInitialData = async () => {
      const roomDocRef = doc(db, 'rooms', roomId);
      
      // Fetch initial data without using a real-time listener
      const roomDoc = await getDoc(roomDocRef);
      if (roomDoc.exists()) {
        const roomData = roomDoc.data();
        setTasks(roomData.tasks); // Set initial tasks on the board

        // Check if the current session user is the moderator
        if (sessionModerator && roomData.moderatorId === sessionModerator.moderatorId) {
          setIsModerator(true);
        }

        // Check if the current player is an observer (not listed in the players array)
        if (currentPlayer && !roomData.players.some(player => player.nickname === currentPlayer.nickname)) {
          setIsObserver(true);
        }
      }
      
      // Enable real-time listener only after the initial data load
      const unsubscribe = onSnapshot(roomDocRef, (doc) => {
        if (doc.exists()) {
          const roomData = doc.data();
          setTasks(roomData.tasks); // Update the board with new task states
        }
      });

      return () => unsubscribe(); // Clean up listener on component unmount
    };

    fetchInitialData();
  }, [roomId, sessionModerator, currentPlayer]);

  // Throttled function to update Firestore for task updates (limits updates to once every second)
  const throttledUpdate = throttle(async (updatedTasks) => {
    const roomDocRef = doc(db, 'rooms', roomId);
    await updateDoc(roomDocRef, {
      tasks: updatedTasks,
    });
  }, 1000);

  const handleTaskClick = async (index) => {
    // Prevent moderators and observers from clicking the tasks
    if (isModerator || isObserver) {
      return;
    }

    const updatedTasks = [...tasks]; // Copy current tasks

    const task = updatedTasks[index];
    
    // Toggle the task state: if already marked, reset it; otherwise, mark with player's info
    if (task.completedBy) {
      // Unmark the task
      updatedTasks[index] = { ...task, completedBy: null, color: null };
    } else {
      // Mark the task as completed by the current player
      updatedTasks[index] = { ...task, completedBy: currentPlayer.nickname, color: currentPlayer.color };
    }

    setTasks(updatedTasks); // Update tasks locally for UI
    throttledUpdate(updatedTasks); // Batch and throttle Firestore updates
  };

  // Function to regenerate random tasks (only for moderators)
  const regenerateTasks = async () => {
    const newTasks = await getRandomTasks(); // Get new random tasks
    const roomDocRef = doc(db, 'rooms', roomId);

    await updateDoc(roomDocRef, {
      tasks: newTasks,
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

      {/* Moderator controls */}
      {isModerator && (
        <div className="moderator-controls">
          <button className="moderator-button" onClick={regenerateTasks}>Regenerate Tasks</button>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
