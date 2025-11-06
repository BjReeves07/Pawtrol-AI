# Pawtrol AI

## Overview

Pawtrol AI is an intelligent animal monitoring system designed to assist pet owners and animal shelters in tracking and understanding animal behavior. The application uses computer vision powered by OpenAI's API to analyze images of animals and detect their behavior patterns. Built with Flask for the backend and vanilla JavaScript for the frontend, it provides a dashboard interface for monitoring animals, uploading images for analysis, viewing behavior logs, and generating summaries.

**Status**: Fully configured and running on Replit with port 5000 and deployment ready.

## Recent Changes

**November 6, 2025** - GitHub Import & Replit Setup
- Migrated project from GitHub to Replit environment
- Removed hardcoded OpenAI API key, now using secure environment variables
- Reorganized file structure to proper Flask conventions (static/ folder for CSS/JS)
- Configured Flask to bind to 0.0.0.0:5000 for Replit hosting
- Updated frontend to use dynamic API URLs (window.location.origin)
- Added cache-control headers to prevent browser caching issues
- Set up workflow for development server
- Configured Gunicorn deployment for production
- Added Python .gitignore file
- Cleaned up unused folders (old frontend/backend directories)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology**: Vanilla JavaScript with HTML/CSS

The frontend uses a single-page application (SPA) pattern with client-side navigation between different views (Dashboard, Animals, Live Monitor, Behavior Logs, Upload, Summaries). Navigation is handled through data attributes and event listeners rather than a full framework.

**Design Decision**: Chose vanilla JavaScript over frameworks like React or Vue to minimize complexity and dependencies. This makes the application lightweight and easier to understand for a monitoring system that doesn't require complex state management.

### Backend Architecture

**Framework**: Flask (Python)

The backend is built as a REST API using Flask with CORS enabled to allow cross-origin requests from the frontend.

**Key Endpoints**:
- `GET /` - Serves the main HTML template with cache-control headers
- `GET /animals` - Returns a hardcoded list of supported animals (Dog, Cat, Bird, Goat)
- `POST /upload` - Accepts image files for AI analysis
- `POST /stream` - Accepts webcam frames for real-time AI analysis
- `GET /behaviors` - Returns behavior logs (currently empty array)
- `GET /summary/daily` - Returns daily AI-generated summary
- `GET /alerts` - Returns active alerts

**Server Configuration**:
- Development: Flask dev server on 0.0.0.0:5000
- Production: Gunicorn with autoscaling deployment
- CORS enabled for cross-origin requests

**Design Decision**: Flask was chosen for its simplicity and Python's strong ecosystem for AI/ML tasks. The stateless REST API design allows for easy scaling and separation of concerns between frontend and backend.

### Image Processing & AI Integration

**Provider**: OpenAI API (Vision capabilities)

Images uploaded by users are converted to base64 encoding and sent to OpenAI's API for analysis. The system prompts the AI to identify:
1. The animal(s) detected in the image
2. Movement or behavior patterns (running, sitting, walking, etc.)

**Design Decision**: Using OpenAI's vision API eliminates the need to train custom ML models, providing immediate high-quality results. Base64 encoding is used to transmit images directly in API requests without requiring separate file storage.

**Trade-offs**: 
- Pros: Quick implementation, high accuracy, no ML infrastructure needed
- Cons: Ongoing API costs, dependency on external service, requires internet connectivity

### Data Storage

**Current State**: No persistent database implementation detected in the repository.

The application currently stores animal types as hardcoded values and does not persist behavior logs, summaries, or historical data.

**Architectural Gap**: Future implementation would likely need a database (suggested: SQLite for simplicity or PostgreSQL for production) to store:
- Uploaded images or references
- Analysis results and behavior logs
- Animal profiles
- Historical summaries

### Authentication & Authorization

**Current State**: No authentication system implemented.

The application currently has no user authentication, session management, or access control mechanisms.

**Architectural Gap**: For production use, especially in animal shelter scenarios with multiple users, an authentication system would be needed to:
- Manage user sessions
- Control access to different animals/data
- Track who performed specific actions

## External Dependencies

### APIs & Services

1. **OpenAI API** (Required)
   - Purpose: Image analysis and behavior detection
   - Configuration: API key stored in environment variable `OPENAI_API_KEY`
   - Integration: Direct API calls from Flask backend using the `openai` Python package

### Python Packages

1. **flask** - Web framework for the backend API
2. **flask-cors** - Enables Cross-Origin Resource Sharing for API access
3. **openai** - Official OpenAI Python client for API integration
4. **gunicorn** - Production WSGI server for deployment

### Static Assets

- Custom CSS (`static/css/styles.css`) - Gradient-based UI with card layouts
- Custom JavaScript (`static/js/script.js`) - Client-side routing and API communication

### Environment Variables

- `OPENAI_API_KEY` - Required for AI image analysis functionality