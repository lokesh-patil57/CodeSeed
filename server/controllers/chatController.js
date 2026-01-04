import Chat from "../models/chatModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { title, selectedLanguage } = req.body;
    const userId = req.userId;

    const chat = new Chat({
      userId,
      title: title || "New Chat",
      selectedLanguage: selectedLanguage || "HTML + CSS",
      messages: [],
    });

    await chat.save();
    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.userId;
    const chats = await Chat.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .select("title createdAt updatedAt selectedLanguage")
      .limit(50);

    res.json({ success: true, chats });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific chat
export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a message and get AI response
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message, selectedLanguage } = req.body;
    const userId = req.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    let chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      // Create new chat if doesn't exist
      chat = new Chat({
        userId,
        title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        selectedLanguage: selectedLanguage || "HTML + CSS",
        messages: [],
      });
    }

    // Update selected language if provided
    if (selectedLanguage) {
      chat.selectedLanguage = selectedLanguage;
    }

    // Add user message
    const userMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };
    chat.messages.push(userMessage);

    // Prepare context for Gemini
    const systemPrompt = `You are an expert AI component generator. Your task is to generate UI components based on user descriptions.

IMPORTANT INSTRUCTIONS:
1. Always generate complete, production-ready code
2. Use the selected framework/language: ${chat.selectedLanguage || selectedLanguage || "HTML + CSS"}
3. When generating code, wrap it in markdown code blocks with the appropriate language tag
4. Provide clean, well-commented code
5. Include all necessary HTML, CSS, and JavaScript in your response
6. Make components responsive and modern
7. Use best practices for the selected framework
8. If the user asks to modify existing code, provide the complete updated code

Framework-specific guidelines:
- For HTML + CSS: Provide complete HTML with embedded CSS
- For React: Provide functional components with hooks
- For Tailwind CSS: Use Tailwind utility classes
- For Vue: Provide Vue single-file component structure
- For Next.js: Use Next.js conventions

Always format your response with proper markdown, including code blocks.`;

    // Add system prompt and current message
    const ai = getGeminiClient();
    const fullPrompt = systemPrompt + "\n\nUser request: " + message.trim();

    // Generate response with fallback models
    let aiContent = "";
    const modelsToTry = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest", 
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];
    
    let lastError = null;
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        aiContent = response.text();
        console.log(`Successfully used model: ${modelName}`);
        break; // Success, exit the loop
      } catch (error) {
        console.warn(`Model ${modelName} failed:`, error.message);
        lastError = error;
        continue; // Try next model
      }
    }
    
    if (!aiContent) {
      throw new Error(
        `AI Service Unavailable. All models failed. Last error: ${lastError?.message || 'Unknown error'}`
      );
    }

    if (!aiContent) {
      throw new Error("Failed to generate response from AI (Empty response)");
    }

    // Extract code blocks from response
    const codeBlocks = extractCodeBlocks(aiContent);

    // Add AI response
    const aiMessage = {
      role: "assistant",
      content: aiContent,
      codeBlocks: codeBlocks.length > 0 ? codeBlocks : undefined,
      timestamp: new Date(),
    };
    chat.messages.push(aiMessage);

    // Update chat title if it's the first message
    if (chat.messages.length === 2 && chat.title === "New Chat") {
      chat.title = message.substring(0, 50) + (message.length > 50 ? "..." : "");
    }

    await chat.save();

    res.json({
      success: true,
      message: aiMessage,
      chat: {
        _id: chat._id,
        title: chat.title,
        selectedLanguage: chat.selectedLanguage,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate response",
    });
  }
};

// Update chat (title, language, etc.)
export const updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title, selectedLanguage } = req.body;
    const userId = req.userId;

    const updateData = {};
    if (title) updateData.title = title;
    if (selectedLanguage) updateData.selectedLanguage = selectedLanguage;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      updateData,
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error("Update chat error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to extract code blocks from markdown
function extractCodeBlocks(content) {
  const codeBlocks = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
      description: "",
    });
  }

  return codeBlocks;
}