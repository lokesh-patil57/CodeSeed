# AI Component Generator - Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database (local or cloud like MongoDB Atlas)
- Google Gemini API Key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation Steps

### 1. Install Client Dependencies

```powershell
cd client
npm install
```

### 2. Install Server Dependencies

```powershell
cd ../server
npm install
```

### 3. Environment Variables Setup

#### Client (.env file in `client/` directory)

Create a `.env` file in the `client` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

#### Server (.env file in `server/` directory)

Create a `.env` file in the `server` directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** Replace the following:
- `your_mongodb_connection_string` - Your MongoDB connection string (e.g., `mongodb://localhost:27017/codeseed` or MongoDB Atlas connection string)
- `your_jwt_secret_here` - A random secret string for JWT token signing
- `your_gemini_api_key_here` - Your Google Gemini API key from Google AI Studio

### 4. Start the Development Servers

#### Terminal 1 - Start the Backend Server

```powershell
cd server
npm run dev
```

The server should start on `http://localhost:3000`

#### Terminal 2 - Start the Frontend Client

```powershell
cd client
npm run dev
```

The client should start on `http://localhost:5173`

## Features

### ✅ Implemented Features

1. **Authentication System**
   - User registration and login
   - Email verification
   - Password reset
   - Google OAuth login

2. **Chat Interface**
   - Collapsible sidebar with chat history
   - New chat creation
   - Chat title editing and deletion
   - Real-time message display
   - Markdown support in messages
   - Typing indicators

3. **Code Generation**
   - Multiple language/framework support:
     - HTML + CSS
     - HTML + Tailwind CSS
     - HTML + Bootstrap
     - HTML + CSS + JS
     - React + Tailwind
     - Vue + Tailwind
     - Angular + Bootstrap
     - Next.js + Tailwind
   - AI-powered component generation using Google Gemini

4. **Code Panel**
   - Split view with chat and code preview
   - Live preview in iframe
   - Syntax-highlighted code display
   - Multiple code block support
   - Export functionality:
     - Download as single file
     - Download as ZIP
     - Export to CodePen
     - Export to CodeSandbox
   - Fullscreen preview mode
   - Refresh preview functionality

5. **Settings Modal**
   - Account settings
   - Theme toggle (Light/Dark mode)
   - Notification preferences
   - Language preferences
   - Data export options

6. **UI/UX Features**
   - Responsive design (mobile-friendly)
   - Smooth animations and transitions
   - Loading states
   - Error handling
   - Toast notifications
   - Custom scrollbars

## Usage

1. **Start a New Chat**: Click the "New Chat" button in the sidebar
2. **Select Language/Framework**: Use the dropdown in the top bar
3. **Send a Message**: Type your component description and press Enter or click Send
4. **View Code**: Click "View in Code Panel" button on any code block
5. **Export Code**: Use the export menu in the code panel
6. **Manage Chats**: Edit or delete chats from the sidebar

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY is not set" error**
   - Make sure you've added your Gemini API key to the server `.env` file
   - Restart the server after adding the key

2. **MongoDB connection error**
   - Verify your MongoDB connection string is correct
   - Make sure MongoDB is running (if using local MongoDB)
   - Check network connectivity (if using MongoDB Atlas)

3. **CORS errors**
   - Ensure `CLIENT_URL` in server `.env` matches your frontend URL
   - Default is `http://localhost:5173` for Vite

4. **Port already in use**
   - Change the `PORT` in server `.env` to a different port
   - Update `VITE_BACKEND_URL` in client `.env` accordingly

## Project Structure

```
CodeSeed/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # Express routes
│   ├── middleware/        # Express middleware
│   └── ...
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/reset-password` - Password reset

### Chat
- `GET /api/chat` - Get all user chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:chatId` - Get specific chat
- `POST /api/chat/:chatId/message` - Send message
- `PATCH /api/chat/:chatId` - Update chat
- `DELETE /api/chat/:chatId` - Delete chat

## Next Steps

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set up MongoDB (local or Atlas)
3. Configure environment variables
4. Start both servers
5. Open `http://localhost:5173` in your browser
6. Register/Login and start generating components!

## Support

For issues or questions, please check:
- The package installation guide: `PACKAGES_AND_INSTALLATION.md`
- Server logs for backend errors
- Browser console for frontend errors

