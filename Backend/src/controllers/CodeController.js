import axios from 'axios';

// OnlineCompiler.io compiler identifiers
export const COMPILER_NAMES = {
    python: 'python-3.14',
    c: 'c-gcc',
    cpp: 'cpp-gcc',
    java: 'java',
    csharp: 'csharp',
    fsharp: 'fsharp',
    go: 'go',
    rust: 'rust',
    php: 'php',
    ruby: 'ruby',
    haskell: 'haskell',
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
                timeout: 31000, // slightly above 30s of execution
            }
        );

        const result = response.data;

        return res.status(200).json({
            success: true,
            data: {
                output: result.output || result.stdout || result.error || 'No output',
                cpu: result.cpu,
                memory: result.memory,
            },
            message: 'Code executed successfully',
        });
    } catch (error) {
        console.error('OnlineCompiler error:', error.response?.data || error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};
