# GitGauge - Repository Analytics Platform - Testing IDE Github Config

GitGauge is a GitHub repository analytics platform that provides comprehensive insights into repository health, team productivity, and code quality metrics. Built with modern web technologies and designed for professional development teams.

## Features

### Comprehensive Repository Analysis
- **Commit Analytics**: Detailed commit patterns, frequency analysis, and author contributions
- **Pull Request Intelligence**: PR lifecycle analysis, review times, merge patterns, and collaboration metrics
- **Issue Management**: Issue lifecycle tracking, resolution patterns, and project health indicators
- **Team Dynamics**: Contributor analysis, knowledge distribution, and team collaboration insights
- **Code Churn Analysis**: Lines of code changes, file activity patterns, and development velocity

### Professional Dashboard
- **Modern UI/UX**: Clean, professional interface built with React and Tailwind CSS
- **Interactive Charts**: Advanced visualizations using Chart.js with responsive design
- **Real-time Analysis**: Live repository analysis with progress tracking
- **Historical Reports**: Store and compare analysis reports over time
- **Export Capabilities**: Download reports and share insights with your team

### Enterprise Features
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Security**: Helmet.js security headers and CORS protection
- **Performance**: Optimized for large repositories with efficient data processing
- **Scalability**: Designed to handle multiple concurrent analyses

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **GitHub REST API** - Repository data source
- **Simple Git** - Git operations and analysis
- **Winston** - Professional logging
- **Helmet** - Security middleware
- **Express Rate Limit** - API protection

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Professional data visualization
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library

### DevOps & Deployment
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Static site hosting
- **ESLint & Prettier** - Code quality and formatting
- **Compression** - Response compression for performance

## Prerequisites

- **Node.js 18+** - JavaScript runtime
- **npm 8+** - Package manager
- **Git** - Version control system
- **GitHub Personal Access Token** - API authentication

## Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/rothluk00044/GitGauge.git
cd GitGauge
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
\`\`\`

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

\`\`\`env
# Required: GitHub Personal Access Token
GITHUB_TOKEN=your_github_personal_access_token_here

# Optional: Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
ANALYSIS_RATE_LIMIT_MAX=20
\`\`\`

### 4. GitHub Personal Access Token Setup

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories)
   - `read:user` (for user information)
4. Copy the token and add it to your `.env` file

### 5. Start Development Servers

\`\`\`bash
# Start both backend and frontend in development mode
npm run dev
\`\`\`

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

### 6. Access the Application

Open your browser and navigate to `http://localhost:5173`

## Production Deployment

### GitHub Pages Deployment

1. **Fork the repository** to your GitHub account

2. **Add repository secrets**:
   - Go to Settings → Secrets and variables → Actions
   - Add `GITHUB_TOKEN` with your Personal Access Token

3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Set source to "GitHub Actions"

4. **Deploy**:
   - Push changes to the `main` branch
   - GitHub Actions will automatically build and deploy

### Manual Deployment

\`\`\`bash
# Build the frontend
cd frontend
npm run build

# The built files will be in the `dist` directory
# Deploy these files to your hosting provider
\`\`\`

### Docker Deployment

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
\`\`\`

## Usage Guide

### Analyzing a Repository

1. **Enter Repository URL**: Input any public GitHub repository URL
2. **Start Analysis**: Click "Analyze Repository" to begin
3. **View Results**: Comprehensive dashboard with metrics and visualizations
4. **Export Data**: Download reports or share insights with your team

### Understanding Metrics

#### Commit Analytics
- **Total Commits**: Overall repository activity
- **Average per Day**: Development consistency
- **Monthly Trends**: Activity patterns over time
- **Author Contributions**: Individual developer impact

#### Pull Request Intelligence
- **Merge Rate**: Code review effectiveness
- **Review Time**: Development velocity indicator
- **Status Distribution**: Workflow health metrics

#### Issue Management
- **Resolution Rate**: Project maintenance quality
- **Average Resolution Time**: Support responsiveness
- **Label Distribution**: Issue categorization insights

#### Team Dynamics
- **Bus Factor**: Knowledge distribution risk
- **Contributor Activity**: Team collaboration patterns
- **Top Contributors**: Key team members identification

### API Endpoints

#### Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "repoUrl": "https://github.com/owner/repository"
}
