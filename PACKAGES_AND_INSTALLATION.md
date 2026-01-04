# AI Component Generator - Required Packages & Installation Guide

## Required Packages

### Client-Side Packages (React/Vite)

#### Core Dependencies
- `react` - React library (already installed)
- `react-dom` - React DOM (already installed)
- `react-router-dom` - Routing (already installed)
- `@google/genai` - Google Gemini AI SDK (already installed)
- `axios` - HTTP client (already installed)
- `lucide-react` - Icons (already installed)
- `react-toastify` - Toast notifications (already installed)

#### New Packages Needed
- `react-markdown` - Markdown rendering for AI responses
- `react-syntax-highlighter` - Syntax highlighting for code blocks
- `@uiw/react-md-editor` - Markdown editor (optional)
- `file-saver` - File download functionality
- `jszip` - Create ZIP files for multi-file exports
- `react-split` - Resizable split panels
- `react-hotkeys-hook` - Keyboard shortcuts
- `date-fns` - Date formatting utilities
- `react-icons` - Additional icons (optional, lucide-react should be enough)

### Server-Side Packages (Node.js/Express)

#### Core Dependencies (already installed)
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `@google/genai` - Google Gemini AI SDK
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `cookie-parser` - Cookie parsing

#### New Packages Needed
- `multer` - File upload handling (if needed)
- `uuid` - Generate unique IDs

## Installation Commands for Windows VS Code Terminal

### Step 1: Navigate to Client Directory
```powershell
cd client
```

### Step 2: Install Client Dependencies
```powershell
npm install react-markdown react-syntax-highlighter file-saver jszip react-split react-hotkeys-hook date-fns
```

### Step 3: Install Type Definitions (for TypeScript support in VS Code)
```powershell
npm install --save-dev @types/react-syntax-highlighter @types/file-saver @types/jszip
```

### Step 4: Navigate to Server Directory
```powershell
cd ../server
```

### Step 5: Install Server Dependencies
```powershell
npm install uuid
```

### Step 6: Return to Root Directory
```powershell
cd ..
```

## Environment Variables Setup

### Client (.env file in `client/` directory)
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Server (.env file in `server/` directory)
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key_here
```

## Quick Install Script (All at Once)

### For Client:
```powershell
cd client && npm install react-markdown react-syntax-highlighter file-saver jszip react-split react-hotkeys-hook date-fns && npm install --save-dev @types/react-syntax-highlighter @types/file-saver @types/jszip && cd ..
```

### For Server:
```powershell
cd server && npm install uuid && cd ..
```

## Package Descriptions

1. **react-markdown**: Renders markdown content from AI responses
2. **react-syntax-highlighter**: Highlights code syntax in code blocks
3. **file-saver**: Downloads files to user's computer
4. **jszip**: Creates ZIP archives for multi-file component exports
5. **react-split**: Creates resizable split panels for code preview
6. **react-hotkeys-hook**: Handles keyboard shortcuts (Ctrl+R for refresh, ESC for fullscreen, etc.)
7. **date-fns**: Formats dates for chat timestamps
8. **uuid**: Generates unique IDs for chats and messages

## Notes

- Make sure Node.js and npm are installed
- Run commands in VS Code integrated terminal or PowerShell
- If you encounter permission errors, run PowerShell as Administrator
- After installation, restart your development server

