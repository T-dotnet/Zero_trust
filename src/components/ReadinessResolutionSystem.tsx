import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, AlertCircle, 
  Cpu, Network, Settings, ChevronRight, Zap, Target, 
  Box, Database, ShieldAlert, FileCode2, Play, Code, Check, Server, Terminal,
  RefreshCw, GitBranch, Search, Plus, X, ChevronDown, Edit3, Save, XCircle, Send, LifeBuoy,
  ExternalLink, ShieldCheck, MessageSquare, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface ComponentProps {
  pipeline: any;
  onUpdatePipeline: (updated: any) => void;
  onBuildImage?: () => void;
}

const LANGUAGES = [
  'Python', 'TypeScript', 'JavaScript', 'C++', 'Go', 'Rust', 'Java', 'R', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'C#', 'Bash'
];

const FRAMEWORKS = [
  'PyTorch', 'TensorFlow', 'Scikit-learn', 'FastAPI', 'Flask', 'Django', 'React', 'Next.js', 'Express', 'Vue', 'Angular', 'Spring Boot', 'Laravel', 'Koa', 'Svelte', 'NumPy', 'Pandas', 'Transformers'
];

const INFRASTRUCTURE_OPTIONS = [
  'Local Model Storage', 'Cloud Storage (S3/GCS)', 'Internal Vault Access', 'GPU Cluster', 'CPU-Only Cluster', 'High Bandwidth Network', 'Private Subnet', 'Air-Gapped Node', 'Relational Database', 'Vector Database', 'Object Storage'
];

export function ReadinessResolutionSystem({ pipeline, onUpdatePipeline, onBuildImage }: ComponentProps) {
  const [resolvedIssues, setResolvedIssues] = useState<string[]>(pipeline.readinessResolvedIssues || []);
  const [completedActions, setCompletedActions] = useState<string[]>(pipeline.readinessCompletedActions || []);
  const [decisionAnswers, setDecisionAnswers] = useState<Record<string, string>>(pipeline.readinessUserInputs || {});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'decisions' | 'actions' | 'architecture'>('issues');
  const [isRechecking, setIsRechecking] = useState(false);

  // Acknowledge & Override State
  const [acknowledgedIssues, setAcknowledgedIssues] = useState<string[]>(pipeline.acknowledgedIssues || []);
  const [issueOverrideComments, setIssueOverrideComments] = useState<Record<string, string>>(pipeline.issueOverrideComments || {});
  const [showOverrideInput, setShowOverrideInput] = useState<string | null>(null);
  const [overrideComment, setOverrideComment] = useState("");

  // Guided Solutions Modal State
  const [guidedAction, setGuidedAction] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Architecture Editing State
  const [isEditingArch, setIsEditingArch] = useState(false);
  const [editedArch, setEditedArch] = useState<any>(null);

  useEffect(() => {
    if (pipeline.architecture) {
      setEditedArch({ ...pipeline.architecture });
    }
  }, [pipeline.architecture]);

  const handleToggleEdit = () => {
    if (isEditingArch) {
      // Save changes
      onUpdatePipeline({
        ...pipeline,
        architecture: editedArch
      });
      setIsEditingArch(false);
    } else {
      setEditedArch({ ...pipeline.architecture });
      setIsEditingArch(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedArch({ ...pipeline.architecture });
    setIsEditingArch(false);
  };

  // Helper Component for Searchable Multi-Select
  const SearchableMultiSelect = ({ 
    options, 
    selected, 
    onChange, 
    placeholder 
  }: { 
    options: string[], 
    selected: string[], 
    onChange: (vals: string[]) => void, 
    placeholder: string 
  }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = options.filter(opt => 
      opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt)
    );

    return (
      <div className="relative">
        <div 
          className="min-h-[42px] p-1.5 bg-white border border-slate-200 rounded-lg flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
          onClick={() => setIsOpen(true)}
        >
          {selected.map(val => (
            <span key={val} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs font-semibold">
              {val}
              <button onClick={(e) => { e.stopPropagation(); onChange(selected.filter(s => s !== val)); }} className="hover:text-indigo-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input 
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 p-0.5 text-xs min-w-[80px]"
            placeholder={selected.length === 0 ? placeholder : ''}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
          <ChevronDown className={`w-4 h-4 text-slate-400 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-3 text-xs text-slate-400 text-center italic">No matches found</div>
              ) : (
                filtered.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { onChange([...selected, opt]); setSearch(''); setIsOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100" />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Helper for List Editing (Entry Points & System Requirements)
  const ListEditor = ({ 
    items, 
    onChange, 
    placeholder,
    icon: Icon
  }: { 
    items: string[], 
    onChange: (vals: string[]) => void, 
    placeholder: string,
    icon: any
  }) => {
    return (
      <div className="space-y-2">
        {items?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input 
                type="text"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-medium text-slate-700"
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[idx] = e.target.value;
                  onChange(next);
                }}
                placeholder={placeholder}
              />
            </div>
            <button 
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button 
          onClick={() => onChange([...(items || []), ''])}
          className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-slate-400 hover:text-slate-500 transition-all"
        >
          <Plus className="w-3 h-3" />
          Add Entry
        </button>
      </div>
    );
  };

  // Helper for Single Select Dropdown (Infrastructure Assumptions)
  const SearchableSelect = ({ 
    options, 
    selected, 
    onChange, 
    placeholder 
  }: { 
    options: string[], 
    selected: string[], 
    onChange: (vals: string[]) => void, 
    placeholder: string 
  }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = options.filter(opt => 
      opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="relative">
        <div 
          className="min-h-[42px] p-1.5 bg-white border border-slate-200 rounded-lg flex flex-wrap gap-1.5 cursor-text focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all items-center px-4"
          onClick={() => setIsOpen(true)}
        >
          <input 
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 p-0.5 text-xs"
            placeholder={placeholder}
            value={isOpen ? search : (selected.length > 0 ? `${selected.length} items selected` : placeholder)}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
              {filtered.map(opt => (
                <button 
                  key={opt}
                  onClick={() => { 
                    const next = selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt];
                    onChange(next);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between group ${selected.includes(opt) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>{opt}</span>
                  {selected.includes(opt) && <Check className="w-3 h-3 text-indigo-600" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Computed data
  const { nodes } = useMemo(() => {
    const n: any[] = [];
    const arch = pipeline.architecture || {};
    
    let idCounter = 1;

    const addGroup = (items: string[], type: string, groupLabel: string) => {
      items?.forEach(req => {
        n.push({
          id: `node-${idCounter++}`,
          type,
          group: groupLabel,
          label: req,
          status: 'normal',
          relatedIssues: []
        });
      });
    };

    addGroup(arch.entry_points, 'entry', 'Entry Points');
    addGroup(arch.languages, 'language', 'Languages');
    addGroup(arch.frameworks, 'framework', 'Frameworks');
    addGroup(arch.dependencies, 'dependency', 'Dependencies');
    addGroup(arch.system_requirements, 'system', 'System Requirements');
    addGroup(arch.infrastructure_assumptions, 'infra', 'Infrastructure');

    // Attempt to link issues to nodes based on text matching
    pipeline.issues?.forEach((issue: any) => {
      if (resolvedIssues.includes(issue.id)) return;
      
      n.forEach(node => {
        if (issue.title.toLowerCase().includes(node.label.toLowerCase()) || 
            issue.description.toLowerCase().includes(node.label.toLowerCase()) ||
            issue.file_path?.toLowerCase().includes(node.label.toLowerCase())) {
          node.relatedIssues.push(issue.id);
          if (issue.severity === 'critical') node.status = 'error';
          else if (node.status !== 'error') node.status = 'warning';
        }
      });
    });

    return { nodes: n };
  }, [pipeline.architecture, pipeline.issues, resolvedIssues]);

  const activeIssues = useMemo(() => {
    return (pipeline.issues || []).filter((i: any) => !resolvedIssues.includes(i.id));
  }, [pipeline.issues, resolvedIssues]);

  const criticalCount = activeIssues.filter((i: any) => i.severity === 'critical').length;
  
  const unresolvedDecisions = useMemo(() => {
    return (pipeline.required_user_inputs || []).filter((d: any) => !decisionAnswers[d.id]);
  }, [pipeline.required_user_inputs, decisionAnswers]);

  const pendingActions = useMemo(() => {
    return (pipeline.suggested_actions || []).filter((a: any) => !completedActions.includes(a.id));
  }, [pipeline.suggested_actions, completedActions]);

  const status = criticalCount > 0 || unresolvedDecisions.filter(d => d.blocks_progress).length > 0 ? 'BLOCKED' : 'READY';
  
  const baseScore = pipeline.base_readiness_score !== undefined ? pipeline.base_readiness_score : (pipeline.readiness_score || 0);
  const liveScore = Math.min(100, baseScore + (resolvedIssues.length * 10) + (Object.keys(decisionAnswers).length * 5) + (acknowledgedIssues.length * 5));

  const handleDecision = (decisionId: string, value: string) => {
    const nextAnswers = { ...decisionAnswers, [decisionId]: value };
    setDecisionAnswers(nextAnswers);
    onUpdatePipeline({
      ...pipeline,
      readinessUserInputs: nextAnswers,
      readiness_score: Math.min(100, baseScore + (resolvedIssues.length * 10) + (Object.keys(nextAnswers).length * 5))
    });
  };

  const executeAction = (actionId: string, linkedIssueIds?: string[]) => {
    const nextActions = [...completedActions, actionId];
    setCompletedActions(nextActions);
    
    let nextResolvedOptions = [...resolvedIssues];
    if (linkedIssueIds && linkedIssueIds.length > 0) {
      // Filter out duplicates
      const newIds = linkedIssueIds.filter(id => !nextResolvedOptions.includes(id));
      nextResolvedOptions = [...nextResolvedOptions, ...newIds];
      setResolvedIssues(nextResolvedOptions);
    }
    
    onUpdatePipeline({
      ...pipeline,
      readinessCompletedActions: nextActions,
      readinessResolvedIssues: nextResolvedOptions,
      readiness_score: Math.min(100, baseScore + (nextResolvedOptions.length * 10) + (Object.keys(decisionAnswers).length * 5) + (acknowledgedIssues.length * 5))
    });
  };

  const handleAcknowledge = (issueId: string) => {
    if (!overrideComment.trim()) return;
    
    const nextAcknowledged = [...acknowledgedIssues, issueId];
    const nextComments = { ...issueOverrideComments, [issueId]: overrideComment };
    
    setAcknowledgedIssues(nextAcknowledged);
    setIssueOverrideComments(nextComments);
    setShowOverrideInput(null);
    setOverrideComment("");
    
    onUpdatePipeline({
      ...pipeline,
      acknowledgedIssues: nextAcknowledged,
      issueOverrideComments: nextComments,
      readiness_score: Math.min(100, baseScore + (resolvedIssues.length * 10) + (Object.keys(decisionAnswers).length * 5) + (nextAcknowledged.length * 5))
    });
  };

  const markActionManual = (actionId: string, linkedIssueIds?: string[]) => {
    // Manual resolution follows the same logic as automation but with a different UI signal potentially
    executeAction(actionId, linkedIssueIds);
  };

  const handleRecheckGit = () => {
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      // In a real app, this would trigger a refetch or re-analysis
    }, 2000);
  };

  const renderNodeIcon = (type: string) => {
    switch(type) {
      case 'language': return <Code className="w-4 h-4" />;
      case 'framework': return <Box className="w-4 h-4" />;
      case 'entry': return <FileCode2 className="w-4 h-4" />;
      case 'dependency': return <Network className="w-4 h-4" />;
      case 'system': return <Cpu className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  const filteredIssuesList = (selectedNodeId 
    ? activeIssues.filter((i: any) => nodes.find(n => n.id === selectedNodeId)?.relatedIssues.includes(i.id))
    : activeIssues).sort((a: any, b: any) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return 0;
    });

  return (
    <div className="flex flex-col h-full bg-slate-50 border-none rounded-none overflow-hidden animate-in fade-in duration-300">
      {/* Header - Sticky */}
      <header className="flex-none sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-20 shadow-sm">
        <div />
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-0.5">Readiness</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold ${liveScore >= 80 ? 'text-emerald-600' : liveScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                {Math.round(liveScore)}
              </span>
              <span className="text-[10px] font-bold text-slate-300">/ 100</span>
            </div>
          </div>
          
          <div className="w-px h-8 bg-slate-100" />
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-0.5">State</span>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              status === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            } flex items-center gap-1`}>
              {status === 'BLOCKED' ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {status}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === 'BLOCKED' && (
              <button 
                onClick={handleRecheckGit}
                disabled={isRechecking}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                  isRechecking 
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-wait' 
                    : 'bg-white text-indigo-600 hover:bg-slate-50 border-indigo-200 border shadow-indigo-100/20'
                }`}
              >
                {isRechecking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <GitBranch className="w-3.5 h-3.5" />
                    Re-check Git & Update
                  </>
                )}
              </button>
            )}
            
            {(liveScore >= 70 || status === 'READY') && (
              <button 
                onClick={() => onBuildImage?.()}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700`}
              >
                Build Image
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Navigation Tree */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Resolution Steps
            </h3>
          </div>
          
          {/* Main Navigation Tabs */}
          <div className="p-3 space-y-1">
            {(liveScore >= 80 || pipeline.submissionStatus === 'Draft') && (
              <button 
                onClick={() => { setActiveTab('architecture'); setSelectedNodeId(null); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border ${activeTab === 'architecture' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'hover:bg-slate-50 text-slate-600 border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <Cpu className={`w-4 h-4 ${activeTab === 'architecture' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`text-xs ${activeTab === 'architecture' ? 'font-semibold' : 'font-medium'}`}>Detected Architecture</span>
                </div>
              </button>
            )}

            <button 
              onClick={() => { setActiveTab('issues'); setSelectedNodeId(null); }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border ${activeTab === 'issues' && !selectedNodeId ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-slate-50 text-slate-600 border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-4 h-4 ${activeTab === 'issues' && !selectedNodeId ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-xs ${activeTab === 'issues' && !selectedNodeId ? 'font-semibold' : 'font-medium'}`}>Detected Issues</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'issues' && !selectedNodeId ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                {activeIssues.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('decisions')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border ${activeTab === 'decisions' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-slate-50 text-slate-600 border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${activeTab === 'decisions' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-xs ${activeTab === 'decisions' ? 'font-semibold' : 'font-medium'}`}>Decision Blocks</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'decisions' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                {unresolvedDecisions.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('actions')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all border ${activeTab === 'actions' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-slate-50 text-slate-600 border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Zap className={`w-4 h-4 ${activeTab === 'actions' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-xs ${activeTab === 'actions' ? 'font-semibold' : 'font-medium'}`}>Action Triggers</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'actions' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                {pendingActions.length}
              </span>
            </button>
          </div>

          <div className="p-5 border-y border-slate-100 bg-slate-50/50">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Architecture Context
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {['Entry Points', 'Languages', 'Frameworks', 'Dependencies', 'System Requirements', 'Infrastructure'].map(group => {
              const groupNodes = nodes.filter(n => n.group === group);
              if (groupNodes.length === 0) return null;
              
              return (
                <div key={group} className="mb-6 last:mb-2">
                  <h4 className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{group}</h4>
                  <div className="space-y-0.5">
                    {groupNodes.map(node => (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelectedNodeId(selectedNodeId === node.id ? null : node.id);
                          setActiveTab('issues');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all border group ${
                          selectedNodeId === node.id 
                            ? 'bg-indigo-50 border-indigo-200' 
                            : 'hover:bg-slate-50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded transition-colors ${
                            selectedNodeId === node.id ? 'bg-white text-indigo-600' : 'bg-slate-50 group-hover:bg-white text-slate-400'
                          }`}>
                            {renderNodeIcon(node.type)}
                          </div>
                          <span className={`text-xs truncate ${selectedNodeId === node.id ? 'font-semibold text-indigo-900' : 'font-medium text-slate-600'}`}>
                            {node.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {node.status === 'error' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />}
                          {node.status === 'warning' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full p-10 space-y-10">
            
            {activeTab === 'architecture' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Detected Architecture</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Automated Fingerprint</p>
                  </div>
                  <div className="flex gap-2">
                    {isEditingArch ? (
                      <>
                        <button 
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                        <button 
                          onClick={handleToggleEdit}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 border border-indigo-700"
                        >
                          <Save className="w-3 h-3" />
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={handleToggleEdit}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 transition-all"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Architecture
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Languages & Frameworks */}
                  <div className={`bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition-all ${isEditingArch ? 'ring-2 ring-indigo-500/10 border-indigo-200' : 'hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${isEditingArch ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        <Terminal className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Stack & Environment</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Core execution technologies</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Languages</span>
                        {isEditingArch ? (
                          <SearchableMultiSelect 
                            options={LANGUAGES} 
                            selected={editedArch?.languages || []}
                            onChange={(vals) => setEditedArch({ ...editedArch, languages: vals })}
                            placeholder="Select Languages..."
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {pipeline.architecture?.languages?.map((l:string, i:number) => (
                              <span key={'l'+i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {l}
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter ml-1">Inferred</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Frameworks</span>
                        {isEditingArch ? (
                          <SearchableMultiSelect 
                            options={FRAMEWORKS} 
                            selected={editedArch?.frameworks || []}
                            onChange={(vals) => setEditedArch({ ...editedArch, frameworks: vals })}
                            placeholder="Select Frameworks..."
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {pipeline.architecture?.frameworks?.map((f:string, i:number) => (
                              <span key={'f'+i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                                <Box className="w-3 h-3 text-blue-400" />
                                {f}
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter ml-1">Inferred</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Entry Points */}
                  <div className={`bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition-all ${isEditingArch ? 'ring-2 ring-indigo-500/10 border-indigo-200' : 'hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${isEditingArch ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        <Play className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Execution Entry</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Main script entry points</p>
                      </div>
                    </div>

                    {isEditingArch ? (
                      <ListEditor 
                        items={editedArch?.entry_points || []}
                        icon={FileCode2}
                        placeholder="e.g. main.py, app.ts"
                        onChange={(vals) => setEditedArch({ ...editedArch, entry_points: vals })}
                      />
                    ) : (
                      <div className="space-y-3">
                        {pipeline.architecture?.entry_points?.map((e:string, i:number) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileCode2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                              <span className="text-xs font-mono font-bold text-slate-700">{e}</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Inferred Source</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Runtime Constraints */}
                  <div className={`bg-white border border-slate-200 rounded-2xl p-8 shadow-sm transition-all md:col-span-2 ${isEditingArch ? 'ring-2 ring-indigo-500/10 border-indigo-200' : 'hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${isEditingArch ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                        <Server className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Resource & Dependency Matrix</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Environmental constraints and hardware assumptions</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4 italic text-left">System Requirements</span>
                        {isEditingArch ? (
                          <ListEditor 
                            items={editedArch?.system_requirements || []}
                            icon={Cpu}
                            placeholder="e.g. RAM: 16GB, GPU: L4"
                            onChange={(vals) => setEditedArch({ ...editedArch, system_requirements: vals })}
                          />
                        ) : (
                          <div className="space-y-4 text-left">
                            {pipeline.architecture?.system_requirements?.map((r:string, i:number) => (
                              <div key={i} className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-bold text-slate-400">{i+1}</span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed pt-0.5">{r}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4 italic text-left">Infrastructure Assumptions</span>
                        {isEditingArch ? (
                          <SearchableSelect 
                            options={INFRASTRUCTURE_OPTIONS} 
                            selected={editedArch?.infrastructure_assumptions || []}
                            onChange={(vals) => setEditedArch({ ...editedArch, infrastructure_assumptions: vals })}
                            placeholder="Select Assumptions..."
                          />
                        ) : (
                          <div className="space-y-4 text-left">
                            {pipeline.architecture?.infrastructure_assumptions?.map((ra:string, i:number) => (
                              <div key={i} className="flex items-start gap-4 relative pl-6 before:absolute before:left-2 before:top-2 before:w-1.5 before:h-1.5 before:bg-indigo-300 before:rounded-full">
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{ra}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'issues' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {selectedNodeId ? `Context: ${nodes.find(n => n.id === selectedNodeId)?.label}` : 'Detected Issues'}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Detection Log</p>
                  </div>
                  {selectedNodeId && (
                    <button 
                      onClick={() => setSelectedNodeId(null)}
                      className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-all shadow-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredIssuesList.map((issue: any) => (
                      <motion.div 
                        key={issue.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`overflow-hidden border rounded-xl bg-white transition-all shadow-sm group ${
                          issue.severity === 'critical' ? 'border-rose-100 hover:border-rose-200' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-start gap-5">
                            <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${
                              acknowledgedIssues.includes(issue.id) 
                                ? 'bg-slate-100 text-slate-400' 
                                : issue.severity === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                            }`}>
                              {acknowledgedIssues.includes(issue.id) ? <ShieldCheck className="w-5 h-5" /> : issue.severity === 'critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <h5 className={`text-sm font-semibold tracking-tight ${acknowledgedIssues.includes(issue.id) ? 'text-slate-500' : 'text-slate-900'}`}>
                                  {issue.title}
                                </h5>
                                <div className="flex items-center gap-2">
                                  {acknowledgedIssues.includes(issue.id) ? (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                      Acknowledged
                                    </span>
                                  ) : (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                      issue.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                      {issue.severity}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className={`text-xs leading-relaxed mb-4 font-medium ${acknowledgedIssues.includes(issue.id) ? 'text-slate-400' : 'text-slate-500'}`}>
                                {issue.description}
                              </p>

                              {acknowledgedIssues.includes(issue.id) && issueOverrideComments[issue.id] && (
                                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-[11px] text-slate-500 flex gap-2">
                                  <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                                  "{issueOverrideComments[issue.id]}"
                                </div>
                              )}

                              {issue.doc_link && (
                                <div className="mb-4">
                                  <a 
                                    href={issue.doc_link} 
                                    target="_blank" 
                                    rel="no-referrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
                                  >
                                    Learn More
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}

                              {issue.suggested_fix && !acknowledgedIssues.includes(issue.id) && (
                                <div className="mb-4 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-none">
                                  <div className="px-3 py-1.5 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggested Fix</span>
                                    <Code className="w-3 h-3 text-slate-500" />
                                  </div>
                                  <div className="p-3">
                                    <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                      {issue.suggested_fix}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {issue.mitigation && (
                                <div className="mt-3 p-3 bg-indigo-50/30 rounded-lg border border-indigo-100/50 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                   <div className="flex items-center gap-2 mb-1.5">
                                     <Zap className="w-3 h-3 text-indigo-500" />
                                     <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Suggested Mitigation</span>
                                   </div>
                                   <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{issue.mitigation}</p>
                                </div>
                              )}

                              {issue.file_path && (
                                <div className="mb-6">
                                   <div className="flex items-center gap-2 mb-1.5">
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">File</span>
                                   </div>
                                   <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600`}>
                                     <FileCode2 className="w-3.5 h-3.5 text-slate-400" /> 
                                     {issue.file_path}{issue.line_number ? `:${issue.line_number}` : ''}
                                   </div>
                                </div>
                              )}
                              
                              <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Actions</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {!acknowledgedIssues.includes(issue.id) && (
                                    <>
                                      {(issue.related_decision_id || issue.relatedDecisionId) && (
                                        <button 
                                          onClick={() => setActiveTab('decisions')}
                                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95"
                                        >
                                          <ChevronRight className="w-3.5 h-3.5" />
                                          Go to Decision
                                        </button>
                                      )}

                                      {(issue.related_action_id || issue.relatedActionId) && (
                                        <button 
                                          onClick={() => setActiveTab('actions')}
                                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95"
                                        >
                                          <ChevronRight className="w-3.5 h-3.5" />
                                          Review Action
                                        </button>
                                      )}

                                      {showOverrideInput === issue.id ? (
                                        <div className="w-full mt-3 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                                          <textarea
                                            value={overrideComment}
                                            onChange={(e) => setOverrideComment(e.target.value)}
                                            placeholder="Enter mandatory justification for override..."
                                            className="w-full p-3 bg-white border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                          />
                                          <div className="flex gap-2 justify-end">
                                            <button 
                                              onClick={() => setShowOverrideInput(null)}
                                              className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-md"
                                            >
                                              Cancel
                                            </button>
                                            <button 
                                              onClick={() => handleAcknowledge(issue.id)}
                                              disabled={!overrideComment.trim()}
                                              className="px-3.5 py-1.5 rounded-md text-[11px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95"
                                            >
                                              Confirm Acknowledge
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setShowOverrideInput(issue.id)}
                                          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-slate-600 text-[11px] font-medium rounded-md border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                                        >
                                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                          Acknowledge & Override
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredIssuesList.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-24 bg-white border border-slate-200 border-dashed rounded-[2.5rem]"
                    >
                      <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-6 text-slate-900">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">Architecturally Sound</h4>
                      <p className="text-sm text-slate-500 font-medium">No active security or implementation issues found in this scope.</p>
                    </motion.div>
                  )}

                  {pipeline.passed_checks?.length > 0 && (
                    <div className="mt-12 space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-slate-900" />
                        Checks Passed
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {pipeline.passed_checks.map((check: any, idx: number) => (
                          <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-4 transition-all hover:bg-slate-50">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                              <Check className="w-4 h-4 text-slate-900" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-bold text-slate-900 mb-0.5 tracking-tight">{check.title}</h5>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{check.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'decisions' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Decision Blocks</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Manual Declarations</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {pipeline.required_user_inputs?.map((decision: any) => (
                    <div key={decision.id} className={`bg-white border rounded-xl p-6 transition-all relative ${decisionAnswers[decision.id] ? 'opacity-60 border-slate-200 shadow-none' : 'border-slate-200 shadow-sm shadow-slate-100/50'}`}>
                      {decisionAnswers[decision.id] && (
                        <div className="absolute top-4 right-4 text-emerald-500">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-50" />
                        </div>
                      )}
                      <div className="flex items-start gap-5">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${decisionAnswers[decision.id] ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-1 tracking-tight">{decision.question}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{decision.reason}</p>
                          </div>

                          {decision.mitigation && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-5 animate-in fade-in slide-in-from-top-1 duration-300">
                               <div className="flex items-center gap-2 mb-1.5">
                                 <Zap className="w-3 h-3 text-indigo-500" />
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggested Mitigation</span>
                               </div>
                               <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{decision.mitigation}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {decision.options?.map((opt: string) => (
                              <button
                                key={opt}
                                onClick={() => handleDecision(decision.id, opt)}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all group ${
                                  decisionAnswers[decision.id] === opt 
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' 
                                    : 'border-slate-100 hover:border-slate-200 bg-white text-slate-600'
                                }`}
                              >
                                <span className={`text-[11px] text-left leading-normal ${decisionAnswers[decision.id] === opt ? 'font-bold' : 'font-medium'}`}>{opt}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ml-2 ${
                                  decisionAnswers[decision.id] === opt 
                                    ? 'border-indigo-600 bg-indigo-600' 
                                    : 'border-slate-200 group-hover:border-slate-400'
                                }`}>
                                  {decisionAnswers[decision.id] === opt && <Check className="w-2 h-2 text-white" strokeWidth={5} />}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-400">
                <div className="flex items-center border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Action Triggers</h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Recommended Alignment</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {pendingActions.map((action: any) => (
                    <div key={action.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-slate-950 -mr-4 -mt-4 transition-transform group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
                        <Zap className="w-24 h-24" />
                      </div>
                      
                      <div className="flex items-start gap-5 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 mb-1 tracking-tight">{action.action}</h4>
                          <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">{action.details}</p>

                          {action.mitigation && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-5 animate-in fade-in slide-in-from-top-1 duration-300">
                               <div className="flex items-center gap-2 mb-1.5">
                                 <Zap className="w-3 h-3 text-indigo-500" />
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggested Mitigation</span>
                               </div>
                               <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{action.mitigation}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <button 
                              onClick={() => executeAction(action.id, pipeline.issues?.filter((i:any) => i.related_action_id === action.id || i.relatedActionId === action.id).map((i:any) => i.id))}
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 text-white text-[11px] font-medium rounded-md hover:bg-indigo-700 transition-all active:scale-95"
                            >
                              <Zap className="w-3 h-3 fill-white" />
                              Run Automation
                            </button>
                            <button 
                              onClick={() => {
                                setGuidedAction(action);
                                setChatMessages([{
                                  role: 'ai',
                                  content: `I'm ready to guide you through solving: **${action.action}**. What part of the process are you stuck on?`
                                }]);
                              }}
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-slate-600 text-[11px] font-medium rounded-md border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              Guided Solutions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingActions.length === 0 && (
                    <div className="text-center py-24 bg-white border border-slate-200 border-dashed rounded-[2.5rem]">
                      <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Zap className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">Optimized Framework</h4>
                      <p className="text-sm text-slate-500 font-medium">No pending structural migrations detected.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Guided Solutions Modal */}
      <AnimatePresence>
        {guidedAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setGuidedAction(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Guided Solutions</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Resolving: {guidedAction.action}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setGuidedAction(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Introduction Details */}
              <div className="p-6 shrink-0 border-b border-slate-100 bg-white">
                <h4 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Context & Analysis</h4>
                <div className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {guidedAction.details}
                  </p>
                  {guidedAction.mitigation && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-amber-800 mb-1">Recommended Approach</h5>
                          <p className="text-xs text-amber-700 leading-relaxed">{guidedAction.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                   <button 
                     onClick={() => {
                       markActionManual(guidedAction.id, pipeline.issues?.filter((i:any) => i.related_action_id === guidedAction.id || i.relatedActionId === guidedAction.id).map((i:any) => i.id));
                       setGuidedAction(null);
                     }}
                     className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                   >
                     <CheckCircle2 className="w-4 h-4" />
                     Mark as Manually Solved
                   </button>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar flex flex-col gap-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm flex-col space-y-2 ${msg.role === 'ai' ? 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm' : 'bg-indigo-600 text-white shadow-md rounded-tr-sm'}`}>
                      <div className="markdown-content text-sm">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;
                    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }, { role: 'ai', content: 'I am analyzing your approach, but as this is a preview shell, I am currently not tied to a live backend. If you need step-by-step help, you can use the code samples generated in the analysis tab or click Mark as Manually Solved to bypass this error block.' }]);
                    setChatInput('');
                  }}
                  className="relative flex items-center"
                >
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask for guidance or clarification..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
