import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore instance
import { getRandomTasks } from '../services/firebaseService'; // Import random tasks function
import alarmSound from '../assets/alarm.mp3'; // Import the alarm sound
import './BingoBoard.css'; // Import CSS file to style the board

const BoardPage = () => {
  const { roomId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [isModerator, setIsModerator] = useState(false); // Track if current user is moderator
  const [isObserver, setIsObserver] = useState(false); // Track if current user is observer
  const currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));
  
  // Get moderator ID from session if available
  const sessionModerator = JSON.parse(sessionStorage.getItem('moderatorId')) || null;

  useEffect(() => {
    const roomDocRef = doc(db, 'rooms', roomId);

    // Real-time listener for the tasks and room data
    const unsubscribe = onSnapshot(roomDocRef, (doc) => {
      if (doc.exists()) {
        const roomData = doc.data();
        setTasks(roomData.tasks); // Update the board with new task states

        // Check if the current session user is the moderator
        if (sessionModerator && roomData.moderatorId === sessionModerator.moderatorId) {
          setIsModerator(true);
        }

        // Check if the current player is an observer (i.e., not listed in the players array)
        if (currentPlayer && !roomData.players.some(player => player.nickname === currentPlayer.nickname)) {
          setIsObserver(true);
        }

        // Play alarm if the "playAlarm" flag is true
        if (roomData.playAlarm) {
          playAlarm(); // Play the sound for all users
          resetPlayAlarm(roomDocRef); // Reset the playAlarm field to false
        }
      }
    });

    return () => unsubscribe(); // Clean up listener when component unmounts
  }, [roomId, sessionModerator, currentPlayer]);

  const handleTaskClick = async (index) => {
    // Prevent moderators and observers from clicking the tasks
    if (isModerator || isObserver) {
      return;
    }

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

  // Function to regenerate random tasks
  const regenerateTasks = async () => {
    const newTasks = await getRandomTasks(); // Get new random tasks
    const roomDocRef = doc(db, 'rooms', roomId);

    await updateDoc(roomDocRef, {
      tasks: newTasks,
    });
  };

  // Function to play alarm sound
  const playAlarm = () => {
    const alarm = new Audio(alarmSound); // Create new Audio object
    alarm.play(); // Play the sound
  };

  // Function to update the "playAlarm" field in Firestore
  const triggerAlarmForAll = async () => {
    const roomDocRef = doc(db, 'rooms', roomId);
    await updateDoc(roomDocRef, {
      playAlarm: true, // Set playAlarm to true
    });
  };

  // Reset the "playAlarm" field after playing the alarm
  const resetPlayAlarm = async (roomDocRef) => {
    await updateDoc(roomDocRef, {
      playAlarm: false, // Reset playAlarm to false
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
          <button className="moderator-button" onClick={triggerAlarmForAll}>Play Alarm</button>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
