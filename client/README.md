# CodeSeed - AI-Powered Code Generation & Learning Platform

## 📋 Table of Contents

- [About CodeSeed](#about-codeseed)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [File Organization](#file-organization)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🌱 About CodeSeed

**CodeSeed** is an AI-powered code generation and learning platform that helps developers write better code faster. It combines the power of artificial intelligence with an intuitive interface to assist developers in:

- **Writing Code**: Generate code snippets in multiple programming languages and frameworks
- **Learning**: Understand code concepts with AI-powered explanations and examples
- **Collaborating**: Share and manage code artifacts with a clean, organized interface
- **Prototyping**: Quickly prototype ideas with support for multiple languages and frameworks

CodeSeed is built for developers who want to leverage AI assistance while maintaining full control over their code and learning process.

---

## ✨ Features

### Chat-Based Interaction
- **Conversation History**: Maintain multiple chat sessions for different projects
- **Context Awareness**: AI remembers the conversation context for better responses
- **Session Management**: Create, rename, and delete chat sessions easily

### Multi-Language Support
- Support for **9+ programming languages and frameworks**:
  - JavaScript/React
  - Python
  - Java
  - C++
  - SQL
  - HTML/CSS
  - TypeScript
  - And more...

### Code Artifacts & Preview
- **Live Code Preview**: See generated code in real-time
- **Syntax Highlighting**: Color-coded syntax for better readability
- **Code Panel**: Dedicated panel for code display and interaction
- **Multiple Artifact Types**: Support for different code formats and structures

### User Authentication
- **Google OAuth Integration**: Quick sign-up and login with Google
- **Email/Password Authentication**: Traditional email-based authentication
- **Session Management**: Secure user sessions with token-based auth
- **Email Verification**: Verify user email addresses for account security

### Dark/Light Theme
- **Theme Toggle**: Switch between dark and light modes
- **Persistent Settings**: Theme preference saved in user settings
- **Optimized UX**: Both themes optimized for comfortable viewing

### Settings & Customization
- **User Settings Modal**: Customize language preferences and other settings
- **Account Management**: Manage profile and account preferences
- **Logout**: Secure logout with session cleanup

### Responsive Design
- **Mobile-Friendly**: Fully responsive on desktop, tablet, and mobile
- **Adaptive Layout**: Sidebar collapses on smaller screens
- **Touch-Friendly**: Optimized interactions for touch devices

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks and context API
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Client-side routing and navigation
- **Lucide React**: Beautiful SVG icons

### State Management
- **Context API**: App-wide state (theme, user info)
- **Custom Hooks**: Encapsulated API operations and logic
- **Local Storage**: Persistent user preferences

### Libraries & Tools
- **React Toastify**: Toast notifications for user feedback
- **date-fns**: Date formatting and manipulation
- **Google Identity Services**: OAuth authentication
- **Axios/Fetch**: HTTP client for API communication

### Development Tools
- **ESLint**: Code quality and style enforcement
- **Hot Module Replacement**: Fast development with auto-reload
- **Environment Variables**: Secure configuration management

---

## 📁 Project Structure

```
client/
├── public/
│   ├── images/          ← Static images
│   └── videos/          ← Static videos
│
├── src/
│   ├── components/      ← Reusable React components
│   ├── constants/       ← Configuration and static data
│   ├── context/         ← React Context for global state
│   ├── hooks/           ← Custom React hooks
│   ├── pages/           ← Page components (Chat, Login, etc.)
│   ├── utils/           ← Utility functions and helpers
│   ├── App.jsx          ← Main app component with routing
│   ├── index.css        ← Global styles
│   └── main.jsx         ← Entry point
│
├── index.html           ← HTML template
├── package.json         ← Dependencies and scripts
├── vite.config.js       ← Vite configuration
├── eslint.config.js     ← ESLint rules
└── README.md            ← This file
```

---

## 🗂️ File Organization

### Constants (`src/constants/`)
Configuration and static data centralized for easy maintenance:
- `chatConfig.js` - Chat application configuration (languages, prompts, colors)
  - AVAILABLE_LANGUAGES - Supported frameworks and languages
  - SUGGESTED_PROMPTS - Default prompt suggestions for users
  - FRAMEWORK_MAP - Mapping of framework codes to display names
  - LANGUAGE_MAP - Mapping of frameworks to programming languages
  - Color constants - Theme colors (PRIMARY_BG, PANEL_BG, ACCENT)

- `loginConfig.js` - Login page configuration
  - FORM_VALIDATION_RULES - Email regex, password/username min length
  - FORM_INITIAL_STATE - Default form state
  - MEET_SECTIONS - "Meet CodeSeed" section content
  - FAQ_ITEMS - Frequently asked questions and answers
  - LOGIN_ERROR_MESSAGES - Error message constants

### Custom Hooks (`src/hooks/`)
Encapsulated API operations and business logic:

- `useChatAPI.js` - Chat API operations
  - `loadChats()` - Fetch all user chats
  - `createNewChat(title, language)` - Create new chat session
  - `loadChat(chatId)` - Load specific chat with messages
  - `sendMessage(chatId, message, language)` - Send message and get AI response
  - `deleteChat(chatId)` - Delete chat with confirmation
  - `updateChatTitle(chatId, newTitle)` - Rename chat
  - `logout()` - User logout

- `useAuthAPI.js` - Authentication operations
  - `login(email, password)` - User login
  - `register(email, password, username)` - User registration

### Utilities (`src/utils/`)
Pure utility functions for common operations:

- `chatHelpers.js` - Chat logic helpers
  - `getGreeting()` - Time-based greeting message
  - `getUserDisplayName(user)` - Extract user name from user object
  - `extractCodeBlocks(content)` - Extract code from AI responses
  - `getFrameworkLabel(value)` - Get display name for framework
  - `getLanguageFromFramework(value)` - Get language for framework

- `formValidation.js` - Form validation
  - `isValidEmail(email)` - Validate email format
  - `isValidPassword(password)` - Validate password strength
  - `isValidUsername(username)` - Validate username format
  - `validateLoginForm(email, password)` - Validate login form
  - `validateSignupForm(email, password, username)` - Validate signup form

### Components (`src/components/`)

#### Chat Components
- `ChatArea.jsx` - Main chat messages and input area
  - Displays messages in chronological order
  - Shows code artifacts from AI responses
  - Input textarea for user messages
  - Loading animations for pending responses

- `Sidebar.jsx` - Navigation sidebar with chat list
  - Chat history with hover actions (rename, delete)
  - New Chat button with language selection
  - User profile section
  - Settings and logout buttons
  - Collapsible on mobile devices

- `MessageBubble.jsx` - Individual message display
  - Different styles for user vs AI messages
  - Timestamp display
  - Message content formatting

- `ArtifactCard.jsx` - Code artifact display
  - Shows code snippets from AI responses
  - Language badge
  - Copy-to-clipboard functionality
  - Opens in code preview panel

- `LoadingAnimation.jsx` - Loading state indicator
  - Animated loading spinner
  - Loading message

#### Login Components
- `AuthBox.jsx` - Authentication form (login/signup)
  - Email/password input fields
  - Username field (visible in signup mode)
  - Show/hide password toggle
  - Google OAuth button
  - Forgot password link
  - Toggle between login and signup modes

- `Collapsible.jsx` - Reusable collapsible component
  - Smooth height animation
  - Can wrap any content
  - Toggle state control
  - Used by MeetSection and FAQItem

- `MeetSection.jsx` - "Meet CodeSeed" section items
  - Icon display (FileText, BookOpen, Users)
  - Title and description
  - Expandable/collapsible content
  - Icon mapping for different sections

- `FAQItem.jsx` - FAQ item with expandable answer
  - Question as clickable button
  - Collapsible answer section
  - Expand/collapse indicator

#### Shared Components
- `Navbar.jsx` - Top navigation bar
  - Logo/app title
  - About button (smooth scroll to Meet CodeSeed)
  - Theme toggle (dark/light mode)
  - User menu dropdown
  - Responsive on mobile

- `Footer.jsx` - Footer section
  - Copyright information
  - Links
  - Additional navigation

- `GoogleLogin.jsx` - Google OAuth button
  - Google Identity Services integration
  - Theme-aware styling
  - Credential handling

- `SettingsModal.jsx` - User settings modal
  - Language preference selection
  - Theme settings
  - Account preferences
  - Save/cancel actions

- `CodeBlock.jsx` - Code block display
  - Syntax highlighting
  - Line numbers
  - Copy button
  - Language indicator

- `CodePanel.jsx` - Code panel container
  - Wrapper for code display
  - Layout management

- `CodePreviewPanel.jsx` - Code preview and language selection
  - Live code preview
  - Language selector dropdown
  - Close button
  - Syntax highlighting

- `CodeSymbolsAnimation.jsx` - Animated code symbols
  - Background animation on login page
  - Floating code symbols
  - Visual effect only

#### Context
- `AppContext.jsx` - Global app state
  - Theme state (isDark, setIsDark)
  - User information (if needed globally)
  - App-wide settings

### Pages (`src/pages/`)
Full page components with routing:

- `Chat.jsx` - Main chat page
  - Combines Sidebar, ChatArea, and CodePreviewPanel
  - Manages chat state and API calls
  - Handles message sending and chat management
  - Responsive layout for mobile

- `Login.jsx` - Login/signup page
  - Two-tab interface (Login/Signup)
  - "Meet CodeSeed" promotional section
  - FAQ section
  - Google OAuth integration
  - Form validation

- `EmailVerify.jsx` - Email verification page
  - Verify user email after signup
  - Resend verification email option
  - Status indicators

- `ResetPassword.jsx` - Password reset page
  - Request password reset
  - Enter reset token
  - Set new password

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Backend server running (see server/README.md)

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd CodeSeed/client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment variables**
Create a `.env.local` file in the client folder:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Get your Google Client ID from [Google Cloud Console](https://console.cloud.google.com)

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

Output files will be in the `dist/` directory.

---

## 💻 Usage

### Running the Development Server
```bash
npm run dev
```
- Starts Vite dev server with hot module replacement
- Accessible at `http://localhost:5173`
- Auto-reloads on file changes

### Building for Production
```bash
npm run build
```
- Creates optimized production build
- Outputs to `dist/` folder
- Minifies and optimizes all assets

### Linting and Code Quality
```bash
npm run lint
```
- Runs ESLint to check code quality
- Shows style and syntax issues
- Use `npm run lint -- --fix` to auto-fix issues

### Project Structure in Use

#### Creating a New Chat
1. Click "New Chat" button in the sidebar
2. Select your preferred programming language/framework
3. Start typing your question or code request
4. AI generates response with code artifacts
5. Click any code artifact to view in preview panel

#### Using Code Preview
1. Click on a code artifact in the chat
2. View syntax-highlighted code in the right panel
3. Change language using the language selector
4. Copy code or close the panel
5. Continue chatting with AI about the code

#### Customizing Settings
1. Click the Settings icon (gear) in sidebar footer
2. Adjust language preferences
3. Customize theme settings
4. Save your changes

#### Managing Chat History
1. View all your chats in the left sidebar
2. Click a chat to open and continue it
3. Hover over chat name to see rename/delete options
4. Rename chats for better organization
5. Delete chats you no longer need

#### Theme Toggle
1. Click the sun/moon icon in the navbar
2. Switch between light and dark modes
3. Your preference is saved automatically

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone <your-fork-url>
   cd CodeSeed
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Keep components modular and reusable (max 300 lines)
   - Extract reusable logic into custom hooks
   - Add comments for complex logic
   - Update related documentation

4. **Test Your Changes**
   ```bash
   npm run dev
   # Test manually in the browser
   npm run lint
   # Check for linting errors
   ```

5. **Commit Your Changes**
   ```bash
   git commit -m "feat: add your feature description"
   git commit -m "fix: resolve issue #123"
   git commit -m "docs: update README"
   git commit -m "refactor: improve component structure"
   ```

6. **Push to Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Give a clear title and description
   - Link related issues with #123
   - Request review from maintainers
   - Address review feedback

### Code Standards
- Use functional components with React hooks
- Keep components under 300 lines
- Extract reusable logic into custom hooks (src/hooks/)
- Extract static data into constants (src/constants/)
- Extract utilities into separate files (src/utils/)
- Use meaningful variable and function names
- Add prop validation with PropTypes or TypeScript (future)
- Follow existing file structure patterns
- Use Tailwind CSS for styling
- Ensure responsive design (mobile-first approach)

### Commit Message Convention
```
<type>: <subject>

<body>

<footer>
```

Types: feat, fix, docs, refactor, test, style, chore, ci

Example:
```
feat: add code export functionality

- Add export button to code artifacts
- Support multiple export formats (txt, py, js)
- Add export confirmation dialog

Closes #45
```

### Bug Reports
Found a bug? Please open an issue with:
- Clear, descriptive title
- Steps to reproduce the bug
- Expected behavior vs actual behavior
- Screenshots or video (if applicable)
- Your environment (OS, browser, Node version)
- Error message or console logs

### Feature Requests
Have an idea? Please open an issue with:
- Clear description of the feature
- Why this feature would be useful
- Potential implementation approach
- Any related features or issues

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file in the root directory for details.

The MIT License is a permissive license that allows:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

With conditions:
- Include license and copyright notice
- State changes made to the code

---

## 📧 Contact

For questions, suggestions, or feedback about CodeSeed:

**Email**: [luckypatil577r@gmail.com](mailto:luckypatil577r@gmail.com)

Feel free to reach out with:
- 💡 Feature requests and suggestions
- 🐛 Bug reports and issues
- ❓ Questions about the codebase
- 💬 General feedback and ideas
- 🤝 Collaboration opportunities

---

## 🎯 Roadmap

Future enhancements planned for CodeSeed:

- [ ] **Team Collaboration**
  - Share chats with team members
  - Real-time collaborative editing
  - Comment and annotation features

- [ ] **Code Snippet Marketplace**
  - Share useful code snippets
  - Browse community snippets
  - Rate and review snippets

- [ ] **Advanced Features**
  - Real-time collaborative editing
  - Advanced code analysis
  - API documentation generator
  - Code quality metrics

- [ ] **Platform Expansion**
  - Mobile app (iOS/Android)
  - Offline mode support
  - VS Code extension
  - Browser extension

- [ ] **AI Customization**
  - Custom AI model training
  - Fine-tuned responses
  - User-specific AI personality

- [ ] **Integration**
  - GitHub integration
  - GitLab integration
  - Slack notifications
  - Email notifications

---

## 🙏 Acknowledgments

- Built with **React** and **Vite** for modern web development
- Styled with **Tailwind CSS** for utility-first styling
- Icons from **Lucide React**
- Powered by **AI** for intelligent code generation
- Thanks to all contributors and users for their feedback and support

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)

---

**Happy coding with CodeSeed! 🚀**

*Last Updated: January 2026*
