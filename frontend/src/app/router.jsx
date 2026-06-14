import React from 'react';
import Home from '../pages/Home.jsx';
import Profile from '../pages/Profile.jsx';
import PostPage from '../pages/PostPage.jsx';
import MoodDashboard from '../pages/MoodDashboard.jsx';
import GratitudeWall from '../pages/GratitudeWall.jsx';
import Challenges from '../pages/Challenges.jsx';
import Chat from '../pages/Chat.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import NotFound from '../pages/NotFound.jsx';
import AICompanion from '../components/chat/AICompanion.jsx';
import AuthPages from '../components/auth/AuthPages.jsx';

export default function Router({ 
  currentPage, 
  user, 
  onNavigate, 
  onAuthSuccess, 
  targetPostId, 
  onUpdatePoints, 
  simCode,
  setSimCode,
  setUser
}) {
  // Guest views
  if (!user) {
    switch (currentPage) {
      case 'landing':
        return <Home onNavigate={onNavigate} user={user} />;
      case 'login':
        return <AuthPages type="login" onAuthSuccess={onAuthSuccess} onNavigate={onNavigate} />;
      case 'register':
        return (
          <AuthPages 
            type="register" 
            onAuthSuccess={(u, page) => {
              setUser(u);
              onNavigate('feed');
            }} 
            onNavigate={onNavigate} 
          />
        );
      case 'forgot':
        return <AuthPages type="forgot" onNavigate={onNavigate} />;
      case 'reset':
        return <AuthPages type="reset" onNavigate={onNavigate} />;
      default:
        return <Home onNavigate={onNavigate} user={user} />;
    }
  }

  // Authenticated views
  switch (currentPage) {
    case 'feed':
      return <PostPage user={user} onNavigate={onNavigate} onShowPostId={targetPostId} />;
    case 'mood':
      return <MoodDashboard user={user} onUpdatePoints={onUpdatePoints} />;
    case 'gratitude':
      return <GratitudeWall user={user} onUpdatePoints={onUpdatePoints} />;
    case 'challenges':
      return <Challenges user={user} onUpdatePoints={onUpdatePoints} />;
    case 'chat':
      return <Chat user={user} />;
    case 'companion':
      return <AICompanion user={user} />;
    case 'profile':
      return <Profile user={user} onNavigate={onNavigate} />;
    case 'admin':
      if (user.isAdmin) {
        return <AdminDashboard />;
      }
      return <NotFound onNavigate={onNavigate} />;
    case 'landing':
      return <Home onNavigate={onNavigate} user={user} />;
    default:
      return <NotFound onNavigate={onNavigate} />;
  }
}
