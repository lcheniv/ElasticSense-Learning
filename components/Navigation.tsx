import React from 'react';
import { ViewMode } from '../types';
import { BookOpen, MessageSquare, Box, Activity, HelpCircle, Layers } from 'lucide-react';

interface NavigationProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: ViewMode.MODULES, label: 'Learning Modules', icon: BookOpen },
    { id: ViewMode.TUTOR, label: 'AI Tutor', icon: MessageSquare },
    { id: ViewMode.ARCH_BUILDER, label: 'Arch. Builder', icon: Box },
    { id: ViewMode.MOCK_INTERVIEW, label: 'Mock Interview', icon: Activity },
    { id: ViewMode.QUIZ, label: 'Quizzes', icon: HelpCircle },
    // { id: ViewMode.FLASHCARDS, label: 'Flashcards', icon: Layers }, // Implementation omitted for brevity in this response
  ];

  return (
    <div className="w-64 bg-elastic-dark border-r border-elastic-hover flex flex-col h-full sticky top-0">
      <div className="p-6 border-b border-elastic-hover">
        <h1 className="text-2xl font-bold text-elastic-teal flex items-center gap-2">
          <Layers className="w-8 h-8 text-elastic-pink" />
          ElasticSense
        </h1>
        <p className="text-xs text-gray-400 mt-2">SA Interview Companion</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-elastic-blue text-white shadow-lg shadow-blue-900/20'
                  : 'text-gray-400 hover:bg-elastic-hover hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-elastic-hover">
        <div className="bg-elastic-card rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Study Progress</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-elastic-yellow h-2 rounded-full w-[45%]"></div>
          </div>
          <p className="text-right text-xs text-elastic-yellow mt-1">45% Ready</p>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
