# Chat Application - Code Organization

## New File Structure

### 📁 Constants
**File:** `src/constants/chatConfig.js`
- Contains all configuration constants
- `AVAILABLE_LANGUAGES`: List of supported frameworks/languages
- `SUGGESTED_PROMPTS`: Welcome screen suggestions
- `FRAMEWORK_MAP` & `LANGUAGE_MAP`: Mappings for code generation
- Theme colors (PRIMARY_BG, PANEL_BG, ACCENT)

### 📁 Hooks
**File:** `src/hooks/useChatAPI.js`
- Custom hook for all chat API operations
- Methods:
  - `loadChats()` - Fetch all chats
  - `createNewChat(title, selectedLanguage)` - Create new chat
  - `loadChat(chatId)` - Load specific chat
  - `sendMessage(chatId, message, selectedLanguage)` - Send message
  - `deleteChat(chatId)` - Delete chat
  - `updateChatTitle(chatId, newTitle)` - Update chat title
  - `logout()` - Logout user

### 📁 Utils
**File:** `src/utils/chatHelpers.js`
- Helper functions for the chat application
- `getGreeting()` - Get time-based greeting
- `getUserDisplayName(user)` - Extract user display name
- `extractCodeBlocks(content)` - Extract code blocks from messages
- `getFrameworkLabel(value)` - Get framework display name
- `getLanguageFromFramework(value)` - Get language from framework

### 📁 Pages
**File:** `src/pages/Chat.jsx`
- Main chat page component
- Manages overall chat state and logic
- Orchestrates between components
- Uses the `useChatAPI` hook for API calls
- Uses helper functions from `chatHelpers.js`
- Imports constants from `chatConfig.js`

### 📁 Components
**File:** `src/components/ChatArea.jsx`
- Pure UI component for chat display
- Handles message rendering
- Artifact display
- Input area with textarea
- Doesn't handle API calls directly

**File:** `src/components/Sidebar.jsx`
- Sidebar navigation component
- Chat list display
- User info and settings
- Responsive design with collapse/expand

**Other Components:**
- `CodePreviewPanel.jsx` - Right panel for code preview
- `CodePanel.jsx` - Legacy code panel
- `SettingsModal.jsx` - Settings dialog
- `MessageBubble.jsx` - Message display
- `ArtifactCard.jsx` - Artifact card component

## Data Flow

```
Chat.jsx (Main Page)
  ├── Uses: useChatAPI hook (API calls)
  ├── Uses: chatHelpers utilities (logic)
  ├── Uses: chatConfig constants
  └── Renders:
      ├── Sidebar (chat list, user info)
      ├── ChatArea (messages, input)
      ├── CodePreviewPanel (code display)
      ├── CodePanel (legacy)
      └── SettingsModal
```

## API Integration

All API calls are centralized in `useChatAPI` hook:
- Handles loading states
- Error handling with toast notifications
- Credential management
- Consistent error messages

## Component Separation

- **ChatArea.jsx**: Pure presentation component
  - No API calls
  - All data passed via props
  - Self-contained UI logic

- **Chat.jsx**: Container component
  - State management
  - API orchestration
  - Business logic
  - Event handling

## Benefits

✅ **Separation of Concerns**: API logic, utilities, and components are separate
✅ **Reusability**: Hooks and utilities can be used in other components
✅ **Maintainability**: Clear file organization and purpose
✅ **Testability**: Easier to unit test utilities and hooks
✅ **Scalability**: Easy to add new features without cluttering main files
