import React, { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { getRandomTasks } from '../services/firebaseService'; // Function to get random tasks
import './ModeratorPage.css'; // Import CSS file to style the moderator page
import { db } from '../firebaseConfig'; // Correct import of Firebase Firestore

const ModeratorPage = () => {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [moderatorId, setModeratorId] = useState(''); // New state for moderatorId
  const [isRoomCreated, setIsRoomCreated] = useState(false);

  const db = getFirestore();
  const navigate = useNavigate(); // Initialize navigate function

  // Function to create the room with random tasks
  const createRoomWithTasks = async () => {
    if (!roomId || !password || !moderatorId) {
      alert('Room ID, password, and moderator ID are required.');
      return;
    }

    try {
      // Get 25 random tasks
      const randomTasks = await getRandomTasks();

      // Reference to the room document
      const roomDocRef = doc(db, 'rooms', roomId);

      // Create the room document in Firestore
      await setDoc(roomDocRef, {
        password: password,   // Add the password
        moderatorId: moderatorId, // Store the moderator ID
        players: [],          // Empty player array (initially no players)
        observers: [],        // Empty observer array (initially no observers)
        tasks: randomTasks,   // Assign 25 random tasks to the room
      });

      // Store the moderatorId in session storage
      sessionStorage.setItem('moderatorId', JSON.stringify({ moderatorId }));

      setIsRoomCreated(true);
      alert('Room created successfully with random tasks!');

      // Navigate to the BoardPage with roomId after successful creation
      navigate(`/room/${roomId}`);

    } catch (error) {
      console.error('Error creating room: ', error);
      alert('Failed to create room. Please try again.');
    }
  };

  return (
    <div className="moderator-page-container">
      <div className="moderator-login-box">
        <h1>Create a Bingo Room (Moderator)</h1>
        {!isRoomCreated ? (
          <div className="moderator-form">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter Room Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Moderator ID"
              value={moderatorId}
              onChange={(e) => setModeratorId(e.target.value)}
            />
            <button onClick={createRoomWithTasks}>Create Room</button>
          </div>
        ) : (
          <div>
            <h2>Room ID: {roomId}</h2>
            <p>The room has been created with random tasks. Redirecting to the board...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorPage;
