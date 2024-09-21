// src/ModeratorPage.js
import React, { useState } from 'react';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';

const ModeratorPage = () => {
  const [password, setPassword] = useState('');
  const [roomId, setRoomId] = useState(null);
  const db = getFirestore();
  const navigate = useNavigate();

  const createRoom = async () => {
    try {
      // Create a new room with a password in Firestore
      const roomRef = await addDoc(collection(db, 'rooms'), {
        password: password,
        players: [],
        observers: [],
        tasks: [] // Add empty array for tasks initially
      });

      // Navigate to the room page with roomId
      setRoomId(roomRef.id);
      navigate(`/room/${roomRef.id}`); // Navigate to the room
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };

  return (
    <div>
      <h1>Moderator: Create a Room</h1>
      <label>Password for Room:</label>
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>

      {roomId && <p>Room created! ID: {roomId}</p>}
    </div>
  );
};

export default ModeratorPage;
