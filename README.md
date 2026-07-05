# 🌱 MindMate: AI Mental Wellness Companion

MindMate is a calm, supportive, and elegant client-side mental wellness application built with React, Vite, and custom CSS styling. It provides users with a zero-judgment zone to talk through stress, log daily moods, practice sensory grounding, and manage self-care tasks.

---

## 🎓 Core Concepts & Architecture

### 1. Agent System
MindMate is designed around an **AI Wellness Companion Agent** powered by the Google Gemini API.
*   **Persona and Guidance**: The agent communicates with warmth, validation, and active listening. It uses a custom system instruction that maintains boundaries—offering support while clarifying it is not a doctor or therapist.
*   **Conversational Memory**: The companion preserves context by formatting the last 10 messages of conversation history into alternating `user` and `model` role components, allowing for rich, natural dialogue.

### 2. Multi-Layer Security & Safeguards
The application incorporates strict safety mechanisms to protect users and developer credentials:
*   **Local Crisis Bypass**: If the user's message matches self-harm or suicide keywords (e.g., *"want to die"*, *"suicide"*), the system instantly interrupts the process, **bypassing the Gemini API entirely**. It immediately renders a prominent, static local help card containing emergency suicide lines for the US, Canada, UK, and international services.
*   **Local Medical Guardrails**: If the user asks for diagnosis or drug recommendations (e.g., *"diagnose me"*, *"do I have bipolar"*, *"prescribe zoloft"*), the app halts the LLM query locally and displays a disclaimer clarifying it cannot diagnose conditions or prescribe medication, directing users to licensed professionals.
*   **Credential Security**: The Gemini API key is never hardcoded. It is loaded through Vite client-side environment variables. Developers must use the `.env.example` template to set up their keys locally; `.env` is omitted from repository tracking to prevent security leaks.

### 3. Built with Antigravity
This application was entirely scaffolded, designed, and iterated using **Antigravity**, Google DeepMind's agentic AI coding assistant. Antigravity helped:
*   Select and implement the Vite + React SPA architecture.
*   Establish the calm visual design tokens (sage-green, cream, soft peach) and custom CSS layouts.
*   Construct the regex-based token splitting Markdown parser to format text safely without `dangerouslySetInnerHTML`.
*   Integrate the async Gemini API and write local fallback systems.

### 4. Deployability & Build Setup
The project is built as a lightweight, static Single Page Application (SPA), making it extremely easy to host on platforms like Vercel, Netlify, or GitHub Pages.

---

## 🚀 Local Setup & Running Instructions

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### 2. Installation
Clone or navigate to the project directory and install the required dependencies:
```bash
npm install
```

### 3. API Key Configuration
1. Locate the `.env.example` file in the root directory.
2. Copy it to create a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and replace `your_api_key_here` with your actual Google Gemini developer key:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...
   ```
   *Note: If the API key is missing or set to the placeholder, the application automatically defaults to a **graceful local fallback engine**, matching keywords offline and returning supportive canned wellness cards.*

### 4. Running the Development Server
Launch the local server:
```bash
npm run dev
```
Open the provided link (usually `http://localhost:5173`) in your browser to interact with MindMate.

### 5. Compiling for Production
To bundle and compile the application for hosting:
```bash
npm run build
```
This outputs a optimized bundle inside the `/dist` directory, ready to be deployed as static files.

## 👥 Team

- **Shima Amiri Fard** 
- **Subhransu Sourav Priyadarshan** 
