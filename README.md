# Overview
Codepilot is a codebase intelligence platform that transforms complex repositories into searchable knowledge bases, helping developers understand, navigate, and onboard into projects faster.It analyzes software repositories and builds an intelligent knowledge layer over the codebase and helps developers understand architecture, trace workflows, and get instant answers about unfamiliar projects through AI-powered code understanding.

# Features
1. Informative AI-generated repository documentation that accelerates the codebase understanding process.
2. Helpful and contect aware AI chat assistant(Powered by RAG) that provides responses with citations and references, enabling users to understand the codebase more effectively.
3. Easy-to-use and intuitive user interface for seamless navigation and exploration.
4. Seamless integration with GitHub for effortless repository analysis and management.
5. Secure authentication and seamless profile management.

# Tech stack 

1. Client application: React JS , Tailwind CSS , ant design
2. Server application: Express JS , Node JS 
3. Intelligence layer: Langchain JS , Gemini 
4. Database: Mongo DB , Mongo DB Vector 
5. Containerization and deployment: Docker , Render , Vercel

# Setup guide

1. **Clone & Configure**: Clone the repository and copy/populate environment credentials:
   * Backend: Create `server/.env` matching the schema in the config.
   * Root: Create a root `.env` file (see `.env.example` for details).
2. **Run Containers**: Start the multi-container environment (MongoDB, Express server, and React Nginx fronted) using Docker Compose:
   ```bash
   docker compose up --build
   ```
3. **Explore Dashboard**: Navigate to `http://localhost:5173` in your browser.

# Deployed links

* **Frontend App (Vercel)**: [https://codepilot-ai-five.vercel.app](https://codepilot-ai-five.vercel.app)
* **Backend API (Render)**: [https://codepilot-backend-cpou.onrender.com](https://codepilot-backend-cpou.onrender.com)
