# CodeSeed - AI-Powered Code Generation & Learning Platform

![CodeSeed](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-v16+-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.0+-blue.svg)

## 📋 Table of Contents

- [About CodeSeed](#about-codeseed)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Troubleshooting](#troubleshooting)

---

## 🌱 About CodeSeed

**CodeSeed** is a full-stack AI-powered code generation and learning platform designed to help developers write better code faster. It combines state-of-the-art artificial intelligence with an intuitive web interface to assist developers in multiple ways:

### What CodeSeed Does

- **Generates Code**: Create code snippets in 9+ programming languages and frameworks
- **Explains Code**: Get AI-powered explanations for code concepts
- **Manages Sessions**: Maintain chat history and organize code artifacts
- **Previews Code**: See syntax-highlighted code with live preview
- **Authenticates Users**: Secure login with Google OAuth or email/password

### Who It's For

- 👨‍💻 Developers learning new languages
- 🏢 Teams collaborating on code
- 🎓 Students studying programming
- 🚀 Developers prototyping ideas
- 🔍 Anyone looking to understand code better

---

## 📁 Project Structure

```
CodeSeed/
├── client/                          ← Frontend (React + Vite)
│   ├── public/
│   │   ├── images/
│   │   └── videos/
│   ├── src/
│   │   ├── components/              ← React components
│   │   ├── constants/               ← Configuration & static data
│   │   ├── context/                 ← Global state (AppContext)
│   │   ├── hooks/                   ← Custom React hooks
│   │   │   ├── useChatAPI.js       ← Chat API operations
│   │   │   └── useAuthAPI.js       ← Authentication API
│   │   ├── pages/                   ← Page components
│   │   │   ├── Chat.jsx            ← Main chat page
│   │   │   ├── Login.jsx           ← Login/signup page
│   │   │   ├── EmailVerify.jsx     ← Email verification
│   │   │   └── ResetPassword.jsx   ← Password reset
│   │   ├── utils/                   ← Utility functions
│   │   │   ├── chatHelpers.js
│   │   │   └── formValidation.js
│   │   ├── App.jsx                  ← Main app component
│   │   ├── index.css                ← Global styles
│   │   └── main.jsx                 ← Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── README.md                    ← Client-specific documentation
│
├── server/                          ← Backend (Node.js + Express)
│   ├── config/
│   │   ├── db.js                   ← Database configuration
│   │   └── nodemailer.js           ← Email service config
│   ├── controllers/
│   │   ├── authController.js       ← Auth logic
│   │   ├── chatController.js       ← Chat logic
│   │   └── userController.js       ← User logic
│   ├── middleware/
│   │   └── userAuth.js             ← Authentication middleware
│   ├── models/
│   │   ├── chatModel.js            ← Chat database model
│   │   └── userModel.js            ← User database model
│   ├── routes/
│   │   ├── authRoutes.js           ← Auth endpoints
│   │   ├── chatRoutes.js           ← Chat endpoints
│   │   └── userRoutes.js           ← User endpoints
│   ├── server.js                    ← Main server file
│   ├── package.json
│   └── .env                         ← Environment variables
│
├── ARCHITECTURE.md                  ← Architecture documentation
├── PROJECT_ORGANIZATION.md          ← File organization guide
├── SETUP_GUIDE.md                   ← Detailed setup guide
└── README.md                        ← This file
```

---

## 🚀 Quick Start

Get CodeSeed running in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd CodeSeed

# 2. Install server dependencies
cd server
npm install

# 3. Create server .env file
# Copy .env.example to .env and update with your credentials

# 4. Start server (from server directory)
npm start
# Server running at http://localhost:5000

# 5. In another terminal, install client dependencies
cd ../client
npm install

# 6. Create client .env.local file
# VITE_BACKEND_URL=http://localhost:5000
# VITE_GOOGLE_CLIENT_ID=your_google_client_id

# 7. Start client (from client directory)
npm run dev
# Client running at http://localhost:5173
```

---

## 🔧 Installation

### Prerequisites

**For Both Client & Server:**
- Node.js v16 or higher
- npm or yarn package manager
- Git

**For Server:**
- MongoDB database (local or MongoDB Atlas)
- SMTP service for emails (or configure with your provider)
- Google OAuth credentials (for Google login feature)

### Detailed Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd CodeSeed
```

#### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration:
# - MONGODB_URI=your_mongodb_connection_string
# - PORT=5000
# - JWT_SECRET=your_jwt_secret_key
# - NODEMAILER_EMAIL=your_email
# - NODEMAILER_PASSWORD=your_app_password
# - GOOGLE_CLIENT_ID=your_google_client_id
# - GOOGLE_CLIENT_SECRET=your_google_client_secret

# Start the server
npm start
# Or for development with auto-reload:
npm run dev
```

Server will be available at `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create .env.local file
echo "VITE_BACKEND_URL=http://localhost:5000" > .env.local
echo "VITE_GOOGLE_CLIENT_ID=your_google_client_id" >> .env.local

# Start development server
npm run dev
```

Client will be available at `http://localhost:5173`

#### 4. Environment Variables Reference

**Server (.env)**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codeseed

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Email (Nodemailer)
NODEMAILER_EMAIL=your_email@gmail.com
NODEMAILER_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Service (if using external API)
OPENAI_API_KEY=your_openai_key
```

**Client (.env.local)**
```env
# Backend API
VITE_BACKEND_URL=http://localhost:5000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 💻 Usage

### Starting the Development Environment

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Client running at http://localhost:5173
```

### Building for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
# Creates optimized build in dist/
```

### Running Tests

```bash
# Client tests
cd client
npm run test

# Server tests (if configured)
cd server
npm run test
```

### Linting

```bash
# Client
cd client
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### Usage Examples

#### Creating a Chat
1. Click "New Chat" in the sidebar
2. Select a programming language
3. Ask a question or request code
4. View AI response with code artifacts
5. Click code to preview in the right panel

#### Using Code Preview
1. Click any code artifact from AI response
2. View syntax-highlighted code
3. Change language if needed
4. Copy to clipboard or close panel

#### Managing Chats
1. View all chats in sidebar
2. Click to open previous chat
3. Hover to rename or delete
4. Search through history

#### Authenticating
1. Go to login page
2. Choose between Email or Google OAuth
3. Create account or login
4. Verify email (if using email auth)
5. Start creating chats

---

## ✨ Features

### Chat Interface
- ✅ Multi-turn conversations
- ✅ Chat history management
- ✅ Rename and delete chats
- ✅ Real-time message streaming
- ✅ Loading animations

### Code Generation
- ✅ Support for 9+ programming languages
- ✅ Multiple framework support
- ✅ Code syntax highlighting
- ✅ Live code preview
- ✅ Copy to clipboard

### Authentication
- ✅ Google OAuth integration
- ✅ Email/password authentication
- ✅ Email verification
- ✅ Password reset
- ✅ Secure session management

### User Experience
- ✅ Dark/light theme toggle
- ✅ Responsive design (mobile-friendly)
- ✅ User settings modal
- ✅ Toast notifications
- ✅ Smooth animations

### Code Organization
- ✅ Modular component structure
- ✅ Custom hooks for API operations
- ✅ Centralized configuration
- ✅ Utility functions for common tasks
- ✅ Clean separation of concerns

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications
- **date-fns** - Date formatting
- **Google Identity Services** - OAuth

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Nodemailer** - Email service
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Dotenv** - Environment variables

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting (optional)
- **Hot Module Replacement** - Live reload
- **MongoDB Compass** - Database GUI
- **Postman** - API testing

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Before Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Read [CONTRIBUTING.md](./CONTRIBUTING.md) if available

### Contribution Process

1. **Make your changes**
   - Follow existing code style
   - Keep components modular
   - Add comments for complex logic
   - Update documentation

2. **Test your changes**
   ```bash
   # For client changes
   cd client
   npm run dev
   npm run lint

   # For server changes
   cd server
   npm run dev
   ```

3. **Commit with clear messages**
   ```bash
   git commit -m "feat: add amazing feature"
   git commit -m "fix: resolve issue #123"
   git commit -m "docs: update README"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Link related issues (#123)
   - Request review from maintainers

### Code Standards

**Frontend (React/JavaScript):**
- Use functional components with hooks
- Keep components under 300 lines
- Extract logic into custom hooks
- Use meaningful variable names
- Follow existing file structure
- Use Tailwind CSS for styling

**Backend (Node.js/JavaScript):**
- Follow RESTful API conventions
- Use async/await for promises
- Add error handling
- Validate input data
- Add JSDoc comments for functions
- Use environment variables for config

### Reporting Issues

Found a bug? Please open an issue with:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, browser)
- Error messages/logs

### Feature Requests

Have an idea? Please open an issue with:
- Clear description of the feature
- Why it would be useful
- Implementation approach (if known)
- Related features or issues

---

## 📄 License

This project is licensed under the **MIT License**.

### MIT License Terms
You are free to:
- ✅ Use commercially
- ✅ Modify the code
- ✅ Distribute the code
- ✅ Use privately

With conditions:
- Include the original license notice
- State any changes made to the code

See the [LICENSE](./LICENSE) file for full details.

---

## 📧 Contact

Have questions or feedback? Reach out!

**Maintainer Email**: [luckypatil577r@gmail.com](mailto:luckypatil577r@gmail.com)

Feel free to contact me about:
- 💡 Feature requests and suggestions
- 🐛 Bug reports
- ❓ Questions about the codebase
- 💬 General feedback
- 🤝 Collaboration opportunities
- 📚 Documentation improvements

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Cannot connect to backend"
**Solution:**
1. Ensure server is running (`npm run dev` in server directory)
2. Check if PORT 5000 is available
3. Verify VITE_BACKEND_URL in client .env.local
4. Check browser console for specific errors

#### Issue: "MongoDB connection failed"
**Solution:**
1. Verify MongoDB is running
2. Check MONGODB_URI in server .env
3. Ensure IP whitelist in MongoDB Atlas (if using cloud)
4. Check network connectivity

#### Issue: "Google OAuth not working"
**Solution:**
1. Verify VITE_GOOGLE_CLIENT_ID in client .env.local
2. Check redirect URI in Google Cloud Console
3. Ensure Google APIs are enabled
4. Clear browser cache and cookies

#### Issue: "Port already in use"
**Solution:**
```bash
# Find process using port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

#### Issue: "CORS errors"
**Solution:**
1. Ensure CORS is enabled in server
2. Check allowed origins in server config
3. Verify client URL matches backend config
4. Clear browser cache

#### Issue: "Email verification not working"
**Solution:**
1. Check Nodemailer configuration in .env
2. Verify email service credentials
3. Check SMTP settings
4. Look for error logs in server terminal

### Getting Help

1. Check existing issues on GitHub
2. Review error messages in browser console
3. Check server logs in terminal
4. Email maintainer with detailed description
5. Include error screenshots and environment details

---

## 📚 Documentation

- [Client Documentation](./client/README.md) - Frontend setup and usage
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [PROJECT_ORGANIZATION.md](./PROJECT_ORGANIZATION.md) - File structure details
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions

---

## 🎯 Roadmap

**Short Term (Q1 2026)**
- [ ] Team collaboration features
- [ ] Advanced code analysis
- [ ] Improved chat persistence

**Medium Term (Q2-Q3 2026)**
- [ ] Mobile app (React Native)
- [ ] VS Code extension
- [ ] Code snippet marketplace

**Long Term (Q4 2026+)**
- [ ] Real-time collaborative editing
- [ ] Custom AI model training
- [ ] API documentation generator

---

## 📊 Statistics

- **Frontend**: ~200 lines per component (average)
- **Backend**: RESTful API with 20+ endpoints
- **Database**: MongoDB with 2 main collections
- **Languages Supported**: 9+ programming languages
- **Total Project Size**: ~50KB minified (client)

---

## 🙏 Acknowledgments

- Built with **React** and **Node.js**
- Styled with **Tailwind CSS**
- Icons from **Lucide React**
- Database with **MongoDB**
- Powered by **AI** for code generation
- Thanks to all contributors and users

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial release |

---

## ⭐ Show Your Support

If you find CodeSeed helpful, please:
- ⭐ Star this repository
- 🔗 Share with friends
- 💬 Provide feedback
- 🤝 Contribute improvements

---

**Happy coding with CodeSeed! 🚀**

---

## 📞 Quick Links

- [GitHub Repository](https://github.com/yourusername/CodeSeed)
- [Live Demo](https://codeseed.example.com)
- [Documentation](./ARCHITECTURE.md)
- [Issues](https://github.com/yourusername/CodeSeed/issues)
- [Discussions](https://github.com/yourusername/CodeSeed/discussions)

---

*Last Updated: January 2026*
*Maintained by Lucky Patil (luckypatil577r@gmail.com)*
