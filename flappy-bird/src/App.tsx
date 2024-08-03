import React from 'react';
import './App.css';
import Game from './components/Game';

const App: React.FC = () => {
  return (
    <div className="game-container">
      <Game />
    </div>
  );
};

export default App;
