import { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Play, Brain, Loader2, Terminal,
    Clock, Database, Lightbulb, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';

const BASE = import.meta.env.VITE_BACKEND_URL;
const opts = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };

// Languages supported by your backend (OnlineCompiler.io)
const LANGUAGES = [
    { value: 'python',     label: 'Python',     monaco: 'python' },
    { value: 'c',          label: 'C',          monaco: 'c' },
    { value: 'cpp',        label: 'C++',        monaco: 'cpp' },
    { value: 'java',       label: 'Java',       monaco: 'java' },
    { value: 'csharp',     label: 'C#',         monaco: 'csharp' },
    { value: 'fsharp',     label: 'F#',         monaco: 'fsharp' },
    { value: 'go',         label: 'Go',         monaco: 'go' },
    { value: 'rust',       label: 'Rust',       monaco: 'rust' },
    { value: 'php',        label: 'PHP',        monaco: 'php' },
    { value: 'ruby',       label: 'Ruby',       monaco: 'ruby' },
    { value: 'haskell',    label: 'Haskell',    monaco: 'haskell' },
    { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
];

const STARTERS = {
    python:     "print('Hello World')",
    c:          '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}',
    cpp:        '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}',
    java:       'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
    csharp:     'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World");\n    }\n}',
    fsharp:     'printfn "Hello World"',
    go:         'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}',
    rust:       'fn main() {\n    println!("Hello World");\n}',
    php:        '<?php\necho "Hello World";',
    ruby:       'puts "Hello World"',
    haskell:    'main = putStrLn "Hello World"',
    typescript: 'console.log("Hello World");',
};


export default function IDEPage() {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(STARTERS.python);
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isAnalysing, setIsAnalysing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [activeTab, setActiveTab] = useState('output'); // 'output' | 'analysis'

    const handleLanguageChange = lang => {
        setLanguage(lang);
        setCode(STARTERS[lang] || '');
        setOutput('');
        setAnalysis(null);
    };

    const handleRun = async () => {
    if (!code.trim()) { toast.error('Write some code first'); return; }
    setIsRunning(true);
    setActiveTab('output');
    try {
        const res = await axios.post(`${BASE}/api/code/execute`, {
            language,
            files: [{ name: `main.${language}`, code, language }],
            stdin,
        }, opts);

        if (res.data.success) {
            const { output, error, status } = res.data.data;
            if (status === 'error' && error) {
                setOutput(error);
            } else {
                setOutput(output || 'No output');
            }
        } else {
            toast.error(res.data.message || 'Execution failed');
            setOutput(res.data.message || 'Execution failed');
        }
    } catch (err) {
        const msg = err.response?.data?.message || 'Failed to execute code';
        toast.error(msg);
        setOutput(msg);
    }
    setIsRunning(false);
    };
    
    const handleAnalyse = async () => {
        if (!code.trim()) { toast.error('Write some code first'); return; }
        setIsAnalysing(true);
        setActiveTab('analysis');
        try {
            const res = await axios.post(`${BASE}/api/code/analyse`, {
                fileName: `main.${language}`,
                content: code,
            }, opts);

            if (res.data.success) {
                setAnalysis(res.data.data);
            } else {
                toast.error(res.data.message || 'Analysis failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to analyze code');
        }
        setIsAnalysing(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col pt-16">

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950">
                    <select value={language} onChange={e => handleLanguageChange(e.target.value)}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
                        {LANGUAGES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2">
                        <button onClick={handleAnalyse} disabled={isAnalysing}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                            {isAnalysing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                            Analyze
                        </button>
                        <button onClick={handleRun} disabled={isRunning}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            Run
                        </button>
                    </div>
                </div>

                {/* Editor + Output split */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                    {/* Editor */}
                    <div className="flex-1 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-800">
                        <Editor
                            height="60vh"
                            language={LANGUAGES.find(l => l.value === language)?.monaco}
                            value={code}
                            onChange={val => setCode(val || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Right panel: stdin + output/analysis */}
                    <div className="flex-1 lg:w-1/2 flex flex-col">

                        {/* Stdin input */}
                        <div className="p-3 border-b border-slate-800">
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5 block">
                                Input (stdin)
                            </label>
                            <textarea value={stdin} onChange={e => setStdin(e.target.value)}
                                rows={2} placeholder="Optional input for your program..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none" />
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-800">
                            <button onClick={() => setActiveTab('output')}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'output' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}>
                                <Terminal className="h-4 w-4" /> Output
                            </button>
                            <button onClick={() => setActiveTab('analysis')}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'text-white border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'}`}>
                                <Brain className="h-4 w-4" /> Analysis
                            </button>
                        </div>

                        {/* Tab content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'output' ? (
                                isRunning ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                                    </div>
                                ) : output ? (
                                    <pre className="text-sm font-mono text-slate-200 whitespace-pre-wrap wrap-break-word">
                                        {output}
                                    </pre>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                        <Terminal className="h-10 w-10 mb-3" />
                                        <p className="text-sm">Click "Run" to see output here</p>
                                    </div>
                                )
                            ) : (
                                isAnalysing ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                                    </div>
                                ) : analysis ? (
                                    <div className="space-y-4">
                                        {analysis.compilationError && (
                                            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-300">{analysis.errorExplanation}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-slate-800 rounded-lg">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                                    <Clock className="h-3.5 w-3.5" /> Time Complexity
                                                </div>
                                                <p className="text-lg font-bold text-blue-400">{analysis.timeComplexity}</p>
                                            </div>
                                            <div className="p-3 bg-slate-800 rounded-lg">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                                    <Database className="h-3.5 w-3.5" /> Space Complexity
                                                </div>
                                                <p className="text-lg font-bold text-purple-400">{analysis.spaceComplexity}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Time Explanation</h4>
                                            <p className="text-sm text-slate-300">{analysis.timeExplanation}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Space Explanation</h4>
                                            <p className="text-sm text-slate-300">{analysis.spaceExplanation}</p>
                                        </div>

                                        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                            <Lightbulb className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                                            <p className="text-sm text-yellow-200">{analysis.suggestions}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                        <Brain className="h-10 w-10 mb-3" />
                                        <p className="text-sm">Click "Analyze" to get AI feedback on your code</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}