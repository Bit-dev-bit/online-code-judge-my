# Online Code Judge

A full-stack online code judge where users can pick a problem, write code in an in-browser editor, and get an instant verdict (Accepted / Wrong Answer / TLE / Runtime Error) after running against hidden test cases.

## Features

- 📋 Browse a list of coding problems
- 📝 In-browser code editor (Monaco — same editor as VS Code) with syntax highlighting
- 🌐 Multi-language support: **Python 3, C++ (GCC), Java (OpenJDK)**
- ⚡ Automatic compilation and execution against multiple test cases per problem
- ✅ Verdicts: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`
- ⏱️ Execution time shown for every submission
- 🎨 Clean dark-themed UI with problem description, sample I/O, and live editor

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React, `@monaco-editor/react`, Axios |
| Backend    | Node.js, Express |
| Execution  | Node's `child_process` (`exec`) — compiles/runs code directly on the host |
| Data       | In-memory problem list (no database yet) |

## How It Works

1. Frontend fetches the problem list from `GET /api/problems` and problem details from `GET /api/problem/:id`.
2. User writes code in the Monaco editor and selects a language.
3. On submit, the code is sent to `POST /api/submit` with `{ problemId, code, language }`.
4. Backend writes the code to a temp file (`temp/script.py`, `temp/solution.cpp`, or `temp/Main.java`), compiles it if needed (C++/Java), and runs it against each test case with a **3-second timeout**.
5. Output is compared with the expected output for every test case; the first mismatch/error determines the final verdict.
6. Verdict + max execution time are sent back and shown in the UI.

## Project Structure
