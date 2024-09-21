// src/BoardPage.jsx
import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const BingoBoard = () => {
  const { roomId } = useParams(); // Get roomId from the URL
  const [tasks, setTasks] = useState([]);
  const db = getFirestore();

  // Fetch room tasks from Firestore
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const roomDocRef = doc(db, 'rooms', roomId);
        const roomDoc = await getDoc(roomDocRef);

        if (roomDoc.exists()) {
          const roomData = roomDoc.data();
          setTasks(roomData.tasks);
        } else {
          console.error('Room not found');
        }
      } catch (error) {
        console.error('Error fetching room data: ', error);
      }
    };

    fetchRoomData();
  }, [db, roomId]);

  return (
    <div>
      <h1>Room ID: {roomId}</h1>
      <h2>Bingo Board</h2>

      {/* Grid for tasks */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '10px', 
        width: '1000px',  // Ensure the grid is within a fixed width for uniformity
        margin: '0 auto', // Center the grid
        padding: '10px'
      }}>
        {tasks.map((task, index) => (
          <div 
            key={index} 
            style={{ 
              border: '1px solid black', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: task.color || 'white'  // Set background color based on task color
            }}
          >
            <p>{task.description}</p>
            <p style={{ fontSize: '12px' }}>
              Completed By: {task.completedBy || 'None'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BingoBoard;
