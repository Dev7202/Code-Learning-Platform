import axios from 'axios';
import { generateWithGroq } from '../utils/generate.js';
import { getAnalysePrompt } from '../utils/prompt.js';

export const COMPILER_NAMES = {
    python:     'python-3.14',
    c:          'gcc-15',
    cpp:        'g++-15',
    java:       'openjdk-25',
    csharp:     'dotnet-csharp-9',
    fsharp:     'dotnet-fsharp-9',
    php:        'php-8.5',
    ruby:       'ruby-4.0',
    haskell:    'haskell-9.12',
    go:         'go-1.26',
    rust:       'rust-1.93',
    typescript: 'typescript-deno',
};

export const executeCode = async (req, res) => {
    try {
        const { language, files, stdin = '' } = req.validatedData;

        const mainFile = files.find(f => f.language === language);
        if (!mainFile) {
            return res.status(400).json({ success: false, message: 'No matching file for selected language' });
        }

        const compilerName = COMPILER_NAMES[language];
        if (!compilerName) {
            return res.status(400).json({ success: false, message: 'Unsupported language' });
        }

        const response = await axios.post(
            process.env.ONLINECOMPILER_API_URL,
            {
                compiler: compilerName,
                code: mainFile.code,
                input: stdin || '',
            },
            {
                headers: {
                    'Authorization': process.env.ONLINECOMPILER_API_KEY,
                    'Content-Type': 'application/json',
                },
                timeout: 31000,
            }
        );

        const result = response.data;

        return res.status(200).json({
            success: true,
            data: {
                output: result.output || '',
                error: result.error || '',
                status: result.status,
                exitCode: result.exit_code,
                time: result.time,
                memory: result.memory,
            },
            message: 'Code executed successfully',
        });
    } catch (error) {
        console.error('OnlineCompiler error:', error.response?.data || error.message);
        return res.status(500).json({ success: false, message: error.response?.data?.error || error.message });
    }
};

export const analyse = async (req, res) => {
    try {
        const prompt = getAnalysePrompt(req.body.content);
        let response = await generateWithGroq(prompt);
        response = response.trim().replace(/^```json\s*|\s*```$/g, '').trim();
        const data = JSON.parse(response);
        return res.status(200).json({ success: true, data, message: 'Analysis successful' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};