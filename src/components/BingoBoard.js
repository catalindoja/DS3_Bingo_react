// src/BingoBoard.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

const BingoBoard = () => {
  const { roomId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [player, setPlayer] = useState(null); // Store current player's info
  const db = getFirestore();

  useEffect(() => {
    const fetchRoomData = async () => {
      const roomDocRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomDocRef);

      if (roomDoc.exists()) {
        const roomData = roomDoc.data();
        setTasks(roomData.tasks); // Load tasks
        // Assuming player's nickname is saved locally or passed as props
        const nickname = localStorage.getItem('nickname');
        const playerInfo = roomData.players.find((p) => p.nickname === nickname);
        setPlayer(playerInfo);
      } else {
        console.error('No such room!');
      }
    };

    fetchRoomData();

    // Set up real-time updates for tasks
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (docSnapshot) => {
      const roomData = docSnapshot.data();
      if (roomData) {
        setTasks(roomData.tasks); // Update tasks in real-time
      }
    });

    return () => unsub(); // Cleanup listener on unmount
  }, [roomId, db]);

  // Mark task as completed by the current player
  const handleTaskClick = async (taskIndex) => {
    if (player) {
      const updatedTasks = tasks.map((task, index) => {
        if (index === taskIndex && !task.completedBy) { // Only update uncompleted tasks
          return { ...task, completedBy: player.nickname, color: player.color };
        }
        return task;
      });

      const roomDocRef = doc(db, 'rooms', roomId);
      await updateDoc(roomDocRef, { tasks: updatedTasks });
    }
  };

  return (
    <div>
      <h1>Bingo Board for Room {roomId}</h1>
      <div className="bingo-board">
        {tasks.length === 0 ? (
          <p>No tasks available yet.</p>
        ) : (
          <div className="task-grid">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="task-cell"
                style={{ backgroundColor: task.color || 'white' }} // Set background color based on task completion
                onClick={() => handleTaskClick(index)} // Player marks the task
              >
                <p>{task.description}</p>
                {task.completedBy && <small>Completed by: {task.completedBy}</small>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BingoBoard;
