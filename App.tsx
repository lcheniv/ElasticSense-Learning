import React, { useState } from 'react';
import Navigation from './components/Navigation';
import ModuleView from './components/ModuleView';
import ChatTutor from './components/ChatTutor';
import ArchitectureBuilder from './components/ArchitectureBuilder';
import QuizView from './components/QuizView';
import { ViewMode } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.MODULES);

  const renderContent = () => {
    switch (currentView) {
      case ViewMode.MODULES:
        return <ModuleView />;
      case ViewMode.TUTOR:
        return <ChatTutor mode="tutor" />;
      case ViewMode.MOCK_INTERVIEW:
        return <ChatTutor mode="interview" />;
      case ViewMode.ARCH_BUILDER:
        return <ArchitectureBuilder />;
      case ViewMode.QUIZ:
        return <QuizView />;
      case ViewMode.FLASHCARDS:
        return <div className="p-8 text-center text-gray-500">Coming Soon</div>;
      default:
        return <ModuleView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-elastic-dark text-white overflow-hidden font-sans">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 h-full overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
