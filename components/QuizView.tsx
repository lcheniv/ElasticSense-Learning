import React, { useState } from 'react';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { HelpCircle, Check, X, ArrowRight, Brain, Trophy } from 'lucide-react';
import { ELASTIC_MODULES } from '../constants';
import ElasticLoader from './ElasticLoader';

const QuizView: React.FC = () => {
  const [topic, setTopic] = useState(ELASTIC_MODULES[0].title);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const startQuiz = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    try {
      const qs = await generateQuizQuestions(topic);
      setQuestions(qs);
    } catch (e) {
      alert("Error generating quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert(`Quiz Finished! Score: ${score + (selectedOption === questions[currentIndex].correctAnswer ? 0 : 0)}/${questions.length}`);
      setQuestions([]); 
    }
  };

  if (questions.length === 0 && !loading) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center bg-gradient-to-br from-elastic-dark to-black">
         <div className="glass-panel p-8 rounded-2xl max-w-lg w-full text-center shadow-2xl relative overflow-hidden border border-gray-800">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-elastic-teal via-elastic-blue to-elastic-pink"></div>
            
            <div className="w-20 h-20 bg-elastic-yellow/10 text-elastic-yellow rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(254,197,20,0.2)]">
                <Brain size={40} />
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-2">Knowledge Check</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">Select a module to test your SA skills. The AI will generate unique scenarios each time.</p>
            
            <div className="mb-8 text-left">
              <label className="text-xs font-bold text-elastic-blue uppercase tracking-wider mb-2 block ml-1">Select Module</label>
              <div className="relative">
                <select 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 text-white rounded-xl p-4 appearance-none focus:outline-none focus:border-elastic-blue transition-colors cursor-pointer"
                >
                  {ELASTIC_MODULES.map(m => (
                    <option key={m.id} value={m.title}>{m.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            <button 
              onClick={startQuiz}
              className="w-full bg-gradient-to-r from-elastic-blue to-blue-700 hover:from-elastic-pink hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              Start Challenge <ArrowRight size={20} />
            </button>
         </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-elastic-dark">
        <ElasticLoader size="lg" text="Generating Scenarios..." />
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="p-4 md:p-8 h-full flex flex-col items-center justify-center bg-elastic-dark">
      <div className="max-w-3xl w-full">
        <div className="flex justify-between items-end mb-8 px-2">
           <div>
             <span className="text-elastic-blue text-xs font-bold uppercase tracking-widest block mb-1">Question {currentIndex + 1} of {questions.length}</span>
             <div className="w-32 h-1 bg-gray-800 rounded-full mt-2">
               <div 
                 className="h-full bg-elastic-blue rounded-full transition-all duration-500"
                 style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
               ></div>
             </div>
           </div>
           <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-gray-800">
             <Trophy size={16} className="text-elastic-yellow" />
             <span className="text-white font-bold text-sm">Score: {score}</span>
           </div>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-800">
           <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed font-sans">{currentQ.question}</h3>
           
           <div className="space-y-4">
             {currentQ.options.map((option, idx) => {
               const isSelected = selectedOption === idx;
               const isCorrect = idx === currentQ.correctAnswer;
               let className = "w-full text-left p-5 rounded-xl border transition-all duration-200 flex justify-between items-center group ";
               
               if (showResult) {
                 if (isCorrect) className += "bg-green-500/10 border-green-500 text-green-100";
                 else if (isSelected && !isCorrect) className += "bg-red-500/10 border-red-500 text-red-100";
                 else className += "opacity-40 border-gray-800";
               } else {
                 className += "bg-black/20 border-gray-700 hover:bg-elastic-hover hover:border-elastic-blue text-gray-200 hover:text-white";
               }

               return (
                 <button 
                   key={idx}
                   onClick={() => handleAnswer(idx)}
                   disabled={showResult}
                   className={className}
                 >
                   <span className="text-sm md:text-base font-medium">{option}</span>
                   {showResult && isCorrect && <Check size={20} className="text-green-400" />}
                   {showResult && isSelected && !isCorrect && <X size={20} className="text-red-400" />}
                 </button>
               );
             })}
           </div>

           {showResult && (
             <div className="mt-8 pt-6 border-t border-gray-700/50 animate-float">
               <div className="bg-elastic-blue/10 border border-elastic-blue/30 rounded-xl p-5 mb-6">
                 <div className="flex items-start gap-3">
                    <Brain className="text-elastic-blue mt-1 shrink-0" size={20} />
                    <div>
                      <span className="font-bold text-elastic-blue block mb-1">Expert Insight</span>
                      <p className="text-sm text-gray-300 leading-relaxed">{currentQ.explanation}</p>
                    </div>
                 </div>
               </div>
               <button 
                 onClick={nextQuestion}
                 className="w-full bg-white text-elastic-dark font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
               >
                 {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;