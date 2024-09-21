// src/JoinPage.js
import React, { useState } from 'react';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';

const JoinPage = () => {
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('player'); // Either 'player' or 'observer'
  const [color, setColor] = useState('#FF5733'); // Default color
  const db = getFirestore();
  const navigate = useNavigate();

  const joinRoom = async () => {
    try {
      // Query Firestore to find room with matching password
      const q = query(collection(db, 'rooms'), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const roomId = querySnapshot.docs[0].id; // Assume the first match
        const roomDocRef = doc(db, 'rooms', roomId);
        const roomData = querySnapshot.docs[0].data();

        // Add player/observer with color to Firestore
        if (role === 'player') {
          const updatedPlayers = [...roomData.players, { nickname, color }];
          await updateDoc(roomDocRef, { players: updatedPlayers });
        } else {
          const updatedObservers = [...roomData.observers, nickname];
          await updateDoc(roomDocRef, { observers: updatedObservers });
        }

        // Navigate to the room
        localStorage.setItem('nickname', nickname); // Save nickname locally
        navigate(`/room/${roomId}`);
      } else {
        alert('Room not found or incorrect password!');
      }
    } catch (error) {
      console.error('Error joining room: ', error);
    }
  };

  return (
    <div>
      <h1>Join a Room</h1>
      <label>Nickname:</label>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />

      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label>Role:</label>
      <div>
        <input
          type="radio"
          value="player"
          checked={role === 'player'}
          onChange={() => setRole('player')}
        />
        <label>Player</label>
        <input
          type="radio"
          value="observer"
          checked={role === 'observer'}
          onChange={() => setRole('observer')}
        />
        <label>Observer</label>
      </div>

      {role === 'player' && (
        <>
          <label>Select Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </>
      )}

      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
};

export default JoinPage;
