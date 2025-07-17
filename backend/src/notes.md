## Key Features
1. GitHub Repository Analysis :
   
   - Fetches repository information, commits, PRs, issues, and contributors
   - Clones repositories for detailed code analysis
   - Provides comprehensive metrics on team dynamics and code churn
2. API Endpoints :
   
   - /api/analyze - Start repository analysis
   - /api/analyze/:id - Get analysis status
   - /api/repo/info - Get repository information
   - /api/health - Health check endpoint
3. Security & Performance :
   
   - Helmet for security headers
   - CORS protection
   - Rate limiting for API protection
   - Compression for better performance
   - Professional logging with Winston

## How to Run the Backend

### Prerequisites
1. Node.js (v14 or higher)
2. npm (v6 or higher)
3. GitHub Personal Access Token (for GitHub API access)

### Running the Server Development Mode
From the backend directory:
- npm run dev
This will start the server with nodemon, which automatically restarts when you make changes.

 Production Mode
From the backend directory:
- npm start
The server will start on port 3001 by default (or the port specified in your .env file).

### Running from Root Directory
From the root GitGauge directory, you can also run:
- npm run dev:backend  # Development mode
or
- npm run dev  # Starts both backend and frontend

## Dependencies
All required dependencies are already specified in the package.json file. Here's what's included:

### Main Dependencies
- express : Web framework
- axios : HTTP client for GitHub API requests
- simple-git : Git operations for repository analysis
- dotenv : Environment variable management
- winston : Logging
- helmet : Security headers
- cors : Cross-origin resource sharing
- compression : Response compression
- morgan : HTTP request logging
- express-rate-limit : API rate limiting

### Dev Dependencies
- nodemon : Auto-restart during development
- jest : Testing framework
- supertest : HTTP testing

## Important Notes
1. GitHub Token : The application requires a valid GitHub Personal Access Token to function. Without this, GitHub API requests will fail with rate limit errors.
2. Temporary Directory : The backend clones repositories to a temporary directory ( ./.tmp by default) for analysis. This directory is automatically created and cleaned up.
3. Logs : Logs are stored in the logs directory. Make sure this directory exists or the application will create it.
4. Rate Limiting : The backend implements rate limiting to prevent abuse. You can adjust these settings in the .env file.
5. Error Handling : The application has a robust error handling system that distinguishes between operational errors (shown to users) and programming errors (logged but not exposed).

## Next Steps
1. Database Integration : The models directory is currently empty, suggesting that database integration might be planned for future versions.
2. Testing : The backend has Jest configured for testing, but test files are not yet implemented.
3. Frontend Integration : The backend is designed to work with a React frontend, which would consume these API endpoints.

## Troubleshooting
- If you encounter GitHub API rate limit errors, check that your GitHub token is valid and has the necessary permissions.
- If the server fails to start, check that all required dependencies are installed ( npm install in the backend directory).
- For logging issues, ensure the logs directory exists and is writable.
- For repository cloning issues, check that the temporary directory is writable and that you have sufficient disk space.