// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ModeratorPage from './pages/ModeratorPage'; // Moderator page
import JoinPage from './pages/JoinPage'; // Player/Observer page
import BingoBoard from './components/BingoBoard'; // Board component once they join the room

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<JoinPage />} /> {/* Join Room page */}
          <Route path="/moderator" element={<ModeratorPage />} /> {/* Moderator Room Creation */}
          <Route path="/room/:roomId" element={<BingoBoard />} /> {/* Bingo Board Room */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
