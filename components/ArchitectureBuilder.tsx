import React, { useState } from 'react';
import { generateArchitectureDesign } from '../services/geminiService';
import { ArchitectureDesign } from '../types';
import { Box, Server, Database, Play, Cpu, DollarSign, Layers, Activity } from 'lucide-react';
import ElasticLoader from './ElasticLoader';

const ArchitectureBuilder: React.FC = () => {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState<ArchitectureDesign | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    try {
      const design = await generateArchitectureDesign(scenario);
      setResult(design);
    } catch (error) {
      console.error(error);
      alert("Failed to generate architecture. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderClusterViz = (nodes: ArchitectureDesign['nodes']) => {
    return (
      <div className="flex flex-wrap gap-6 justify-center py-8">
        {nodes.map((node, idx) => (
          <div key={idx} className="flex flex-col items-center group">
            <div className={`
              relative p-4 rounded-xl border w-36 h-36 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl
              ${node.type === 'master' ? 'border-elastic-pink/50 bg-elastic-pink/10 shadow-[0_0_15px_rgba(255,90,146,0.1)]' : ''}
              ${node.type === 'data' ? 'border-elastic-blue/50 bg-elastic-blue/10 shadow-[0_0_15px_rgba(0,119,204,0.1)]' : ''}
              ${node.type === 'coordinating' ? 'border-gray-500/50 bg-gray-500/10' : ''}
              ${node.type === 'ml' ? 'border-elastic-teal/50 bg-elastic-teal/10 shadow-[0_0_15px_rgba(0,191,179,0.1)]' : ''}
              ${node.type === 'ingest' ? 'border-elastic-yellow/50 bg-elastic-yellow/10 shadow-[0_0_15px_rgba(254,197,20,0.1)]' : ''}
            `}>
              <div className="absolute top-2 right-2 opacity-50">
                  <Activity size={12} className={node.type === 'master' ? 'animate-pulse text-elastic-pink' : 'text-gray-600'} />
              </div>
              <Server size={32} className={`mb-3 
                ${node.type === 'master' ? 'text-elastic-pink' : ''}
                ${node.type === 'data' ? 'text-elastic-blue' : ''}
                ${node.type === 'coordinating' ? 'text-gray-400' : ''}
                ${node.type === 'ml' ? 'text-elastic-teal' : ''}
                ${node.type === 'ingest' ? 'text-elastic-yellow' : ''}
              `} />
              <span className="text-3xl font-extrabold text-white tracking-tighter">{node.count}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-2">{node.type}</span>
              
              {node.count > 1 && (
                <div className="absolute -top-1 -right-1 w-full h-full border border-inherit rounded-xl bg-inherit -z-10 translate-x-2 -translate-y-2 opacity-60"></div>
              )}
            </div>
            <div className="mt-3 text-[10px] text-center text-gray-400 w-32 font-mono bg-black/30 py-1 px-2 rounded">{node.specs}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gradient-to-b from-elastic-dark to-black/80">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-3 flex items-center gap-3">
            <Box className="text-elastic-yellow" size={36} /> 
            <span className="text-gradient">Architecture Sandbox</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Describe a customer workload. The AI will design a production-ready Elastic cluster topology, complete with ILM policies and cost analysis.
          </p>
        </header>

        <div className="glass-panel p-1 rounded-2xl mb-10 shadow-2xl">
          <div className="bg-elastic-dark/90 rounded-xl p-6">
            <label className="block text-sm font-bold text-elastic-blue mb-3 uppercase tracking-wider">Scenario Description</label>
            <div className="relative">
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="e.g. 'Customer is a Fintech bank. Needs to store 2TB of transaction logs per day for compliance (7 years). Hot search needed for 7 days. High security requirements.'"
                className="w-full bg-black/40 border border-gray-700 rounded-lg p-5 text-white placeholder-gray-600 focus:outline-none focus:border-elastic-pink focus:ring-1 focus:ring-elastic-pink h-40 resize-none font-mono text-sm leading-relaxed transition-all"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !scenario}
                className={`absolute bottom-4 right-4 bg-gradient-to-r from-elastic-blue to-blue-600 hover:from-elastic-pink hover:to-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${loading || !scenario ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
              >
                {loading ? 'Processing...' : <><Play size={16} fill="currentColor" /> Generate Design</>}
              </button>
            </div>
          </div>
        </div>

        {loading && (
           <div className="py-20 flex justify-center">
             <ElasticLoader size="lg" text="Architecting Solution..." />
           </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-float">
            {/* Visual Topology */}
            <div className="glass-panel rounded-2xl p-8 border border-elastic-blue/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-elastic-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers size={20} className="text-elastic-teal"/> Recommended Topology</h3>
                 <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-mono">STATUS: OPTIMAL</span>
              </div>
              
              {renderClusterViz(result.nodes)}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-black/40 p-5 rounded-xl flex items-center gap-4 border border-gray-800">
                   <div className="p-3 bg-elastic-teal/20 rounded-lg">
                      <Database className="text-elastic-teal" size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase text-gray-500 font-bold">Shards per Index</p>
                     <p className="text-2xl font-bold text-white font-mono">{result.shardsPerIndex}</p>
                   </div>
                </div>
                <div className="bg-black/40 p-5 rounded-xl flex items-center gap-4 border border-gray-800">
                   <div className="p-3 bg-elastic-pink/20 rounded-lg">
                      <Cpu className="text-elastic-pink" size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase text-gray-500 font-bold">Replica Count</p>
                     <p className="text-2xl font-bold text-white font-mono">{result.replicaCount}</p>
                   </div>
                </div>
                <div className="bg-black/40 p-5 rounded-xl flex items-center gap-4 border border-gray-800">
                   <div className="p-3 bg-elastic-yellow/20 rounded-lg">
                      <DollarSign className="text-elastic-yellow" size={24} />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase text-gray-500 font-bold">Est. Monthly Cost</p>
                     <p className="text-xl font-bold text-white font-mono text-gradient">{result.costEstimation}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl p-6 border-l-4 border-elastic-blue">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">Design Rationale</h3>
                <p className="text-gray-300 leading-relaxed text-sm">{result.summary}</p>
              </div>
              
              <div className="glass-panel rounded-2xl p-6 border-l-4 border-elastic-pink">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">ILM Strategy</h3>
                 <p className="text-gray-300 leading-relaxed text-sm">{result.ilmPolicy}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitectureBuilder;