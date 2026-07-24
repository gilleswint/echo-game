import React from 'react';
import { useGame } from './context/GameContext';
import { Toast } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { LobbyPage } from './pages/LobbyPage';
import { RoleRevealPage } from './pages/RoleRevealPage';
import { CluePage } from './pages/CluePage';
import { DiscussionPage } from './pages/DiscussionPage';
import { VotingPage } from './pages/VotingPage';
import { RevealPage } from './pages/RevealPage';
import { GameOverPage } from './pages/GameOverPage';

export const AppContent: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState) {
    return <LandingPage />;
  }

  switch (gameState.phase) {
    case 'Lobby':
      return <LobbyPage />;
    case 'RoleReveal':
      return <RoleRevealPage />;
    case 'Clues':
      return <CluePage />;
    case 'Discussion':
      return <DiscussionPage />;
    case 'Voting':
      return <VotingPage />;
    case 'Reveal':
      return <RevealPage />;
    case 'GameOver':
      return <GameOverPage />;
    default:
      return <LobbyPage />;
  }
};

export const App: React.FC = () => {
  return (
    <>
      <Toast />
      <AppContent />
    </>
  );
};

export default App;
