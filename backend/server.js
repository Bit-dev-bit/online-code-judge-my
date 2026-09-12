const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(express.json());
app.use(cors());

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Multiple Problems Database
const problems = [
    {
        id: 1,
        title: "Add Two Numbers",
        description: "Write a program to take two integers as input and print their sum.",
        sampleInput: "2 3",
        sampleOutput: "5",
        testCases: [
            { input: "2 3", expectedOutput: "5" },
            { input: "10 20", expectedOutput: "30" },
            { input: "-5 5", expectedOutput: "0" }
        ]
    },
    {
        id: 2,
        title: "Even or Odd",
        description: "Write a program to check whether a given integer is even or odd. Print 'Even' if it is even, otherwise print 'Odd'.",
        sampleInput: "4",
        sampleOutput: "Even",
        testCases: [
            { input: "4", expectedOutput: "Even" },
            { input: "7", expectedOutput: "Odd" },
            { input: "0", expectedOutput: "Even" }
        ]
    },
    {
        id: 3,
        title: "Find Maximum of Three",
        description: "Write a program to take three space-separated integers as input and print the maximum among them.",
        sampleInput: "10 25 15",
        sampleOutput: "25",
        testCases: [
            { input: "10 25 15", expectedOutput: "25" },
            { input: "100 45 78", expectedOutput: "100" },
            { input: "-2 -5 -1", expectedOutput: "-1" }
        ]
    }
];

const executeWithTimeout = (command, inputData, timeoutMs = 3000) => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const child = exec(command, { timeout: timeoutMs }, (error, stdout, stderr) => {
            const executionTime = Date.now() - startTime;
            
            if (error) {
                if (error.killed) {
                    return resolve({ verdict: 'Time Limit Exceeded', executionTime });
                }
                return resolve({ verdict: 'Runtime Error', executionTime, details: stderr || error.message });
            }
            if (stderr) {
                return resolve({ verdict: 'Runtime Error', executionTime, details: stderr });
            }
            
            resolve({ verdict: 'Accepted', executionTime, output: stdout.trim() });
        });

        if (inputData) {
            child.stdin.write(inputData);
            child.stdin.end();
        }
    });
};

// Get list of all problems
app.get('/api/problems', (req, res) => {
    const list = problems.map(p => ({ id: p.id, title: p.title }));
    res.json(list);
});

// Get specific problem details
app.get('/api/problem/:id', (req, res) => {
    const problem = problems.find(p => p.id === parseInt(req.params.id));
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json(problem);
});

// Submit code for a specific problem
app.post('/api/submit', async (req, res) => {
    const { problemId, code, language } = req.body;
    const problem = problems.find(p => p.id === parseInt(problemId));
    
    if (!problem || !code || !language) {
        return res.status(400).json({ verdict: 'Compilation Error', executionTime: 0 });
    }

    let filename = '';
    let command = '';
    const isWin = process.platform === 'win32';

    try {
        if (language === 'python') {
            filename = path.join(tempDir, 'script.py');
            fs.writeFileSync(filename, code);
            const pyCmd = isWin ? 'python' : 'python3';
            command = `${pyCmd} "${filename}"`;
        } 
        else if (language === 'cpp') {
            filename = path.join(tempDir, 'solution.cpp');
            const exeFile = path.join(tempDir, isWin ? 'solution.exe' : 'solution.out');
            fs.writeFileSync(filename, code);
            command = `g++ "${filename}" -o "${exeFile}" && "${exeFile}"`;
        }
        else if (language === 'java') {
            filename = path.join(tempDir, 'Main.java');
            fs.writeFileSync(filename, code);
            command = `javac "${filename}" && java -cp "${tempDir}" Main`;
        }
        else {
            return res.status(400).json({ verdict: 'Unsupported Language', executionTime: 0 });
        }

        let finalVerdict = 'Accepted';
        let maxTime = 0;

        for (const tc of problem.testCases) {
            const result = await executeWithTimeout(command, tc.input);
            maxTime = Math.max(maxTime, result.executionTime);

            if (result.verdict !== 'Accepted') {
                finalVerdict = result.verdict;
                break;
            }

            const cleanOutput = result.output.replace(/\r\n/g, '\n').trim();
            const cleanExpected = tc.expectedOutput.replace(/\r\n/g, '\n').trim();

            if (cleanOutput !== cleanExpected) {
                finalVerdict = 'Wrong Answer';
                break;
            }
        }

        res.json({ verdict: finalVerdict, executionTime: maxTime });

    } catch (err) {
        res.status(500).json({ verdict: 'Internal Server Error', executionTime: 0 });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server running smoothly on port ${PORT}`);
});