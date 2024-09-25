// src/JoinPage.jsx
import React, { useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './JoinPage.css'; // Import CSS file to style the join page
import { db } from '../firebaseConfig'; // Correct import of Firebase Firestore

const JoinPage = () => {
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isPlayer, setIsPlayer] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#000000'); // Default color
  const [errorMessage, setErrorMessage] = useState('');

  const db = getFirestore();
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!roomId || !nickname || !password) {
      setErrorMessage('Room ID, Nickname, and Password are required.');
      return;
    }

    try {
      const roomDocRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomDocRef);

      if (!roomDoc.exists()) {
        setErrorMessage('Room not found.');
        return;
      }

      const roomData = roomDoc.data();

      // Validate password
      if (roomData.password !== password) {
        setErrorMessage('Incorrect password.');
        return;
      }

      // Check if user is joining as a player or observer
      if (isPlayer) {
        // Add the player to the room's players list
        await updateDoc(roomDocRef, {
          players: arrayUnion({
            nickname: nickname,
            color: selectedColor,
          }),
        });

        // Save player nickname and color in session storage
        sessionStorage.setItem('currentPlayer', JSON.stringify({
          nickname: nickname,
          color: selectedColor,
        }));

      } else {
        // Add the observer to the room's observers list
        await updateDoc(roomDocRef, {
          observers: arrayUnion({
            nickname: nickname,
          }),
        });
      }

      // Navigate to the board page after successfully joining
      navigate(`/room/${roomId}`);

    } catch (error) {
      console.error('Error joining room:', error);
      setErrorMessage('Failed to join room. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h1>Join Bingo Room</h1>

        <label>Enter Room ID</label>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <label>Enter Nickname</label>
        <input
          type="text"
          placeholder="Enter Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <label>Enter Room Password</label>
        <input
          type="password"
          placeholder="Enter Room Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Select the type of user you want to join as:</label>
        <div>
          <label>
            Player
          </label>
          <input
              type="radio"
              checked={isPlayer}
              onChange={() => setIsPlayer(true)}
          />
          <label>
            Spectator
          </label>
          <input
              type="radio"
              checked={!isPlayer}
              onChange={() => setIsPlayer(false)}
            />
        </div>

        {isPlayer && (
          <div>
            <label>Select your color:</label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
        )}

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default JoinPage;
