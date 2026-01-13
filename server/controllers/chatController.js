import Chat from "../models/chatModel.js";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
  });
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

COMPONENT DESCRIPTION FORMAT (REQUIRED):
- For EACH component you generate, provide a clear description BEFORE the code block
- Use bullet points format with dashes (-) or asterisks (*) to list component features
- Include 3-5 bullet points describing:
  * What the component does
  * Key features or functionality
  * Design characteristics
  * Interactive elements (if any)
  * Responsive behavior
- Format example:
  Here's a [Component Name] component:
  
  - Feature 1 description
  - Feature 2 description
  - Feature 3 description
  
  \`\`\`language
  [code here]
  \`\`\`

- If generating MULTIPLE components, provide descriptions for ALL of them
- Each component should have its own description section before its code block

Framework-specific guidelines:
- For HTML + CSS: Provide complete HTML with embedded CSS
- For React: Provide functional components with hooks
- For Tailwind CSS: Use Tailwind utility classes
- For Vue: Provide Vue single-file component structure
- For Next.js: Use Next.js conventions

Always format your response with proper markdown, including code blocks and bullet point descriptions.`;

    // Add system prompt and current message
    const ai = getGeminiClient();
    const fullPrompt = systemPrompt + "\n\nUser request: " + message.trim();

    // Generate response with fallback models
    let aiContent = "";
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
    ];
    
    let lastError = null;
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        const result = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }]
            }
          ]
        });
        // Extract text from response - @google/genai returns candidates with content
        if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
          aiContent = result.candidates[0].content.parts[0].text;
        } else if (typeof result?.text === 'function') {
          aiContent = result.text();
        } else if (result?.text) {
          aiContent = result.text;
        }
        
        if (!aiContent) {
          throw new Error('Empty response from model');
        }
        
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

// Generate code from user description
export const generateCode = async (req, res) => {
  try {
    const { prompt, framework } = req.body;
    const userId = req.userId;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const selectedFramework = framework || "HTML + CSS";

    // Prepare system prompt for code generation
    const systemPrompt = `You are an expert UI/component code generator. Generate clean, production-ready code based on user descriptions.

Framework: ${selectedFramework}

IMPORTANT:
1. Generate ONLY the code, wrapped in a markdown code block with the appropriate language
2. The code must be complete and ready to use
3. Include all necessary HTML, CSS, and JavaScript
4. Use modern best practices
5. Make it responsive if applicable
6. For frameworks like React/Vue, provide the complete component
7. For HTML+CSS, include inline CSS or style tags
8. For Tailwind, use Tailwind utility classes

COMPONENT DESCRIPTION FORMAT (REQUIRED):
- Provide a clear description BEFORE the code block
- Use bullet points format with dashes (-) or asterisks (*) to list component features
- Include 3-5 bullet points describing:
  * What the component does
  * Key features or functionality
  * Design characteristics
  * Interactive elements (if any)
  * Responsive behavior
- Format example:
  
  Here's a [Component Name] component:
  
  - Feature 1 description
  - Feature 2 description
  - Feature 3 description
  
  \`\`\`language
  [code here]
  \`\`\`

- If generating MULTIPLE components, provide descriptions for ALL of them
- Each component should have its own description section before its code block

Code block format:
\`\`\`language
code here
\`\`\`

User description: ${prompt.trim()}`;

    const ai = getGeminiClient();

    // Try multiple models with fallback
    let aiContent = "";
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
    ];

    let lastError = null;
    for (const modelName of modelsToTry) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }]
            }
          ]
        });
        
        // Debug: log the result structure
        console.log(`Response from ${modelName}:`, typeof result, Object.keys(result || {}).slice(0, 10));
        
        // Try different ways to extract text
        if (result?.text && typeof result.text === 'string') {
          aiContent = result.text;
        } else if (result?.response?.text && typeof result.response.text === 'string') {
          aiContent = result.response.text;
        } else if (result?.content) {
          // Handle response object with content property
          aiContent = JSON.stringify(result.content);
        } else if (result?.candidates) {
          // Handle candidates array
          const textContent = result.candidates[0]?.content?.parts?.[0]?.text;
          if (textContent) {
            aiContent = textContent;
          }
        } else {
          // Last resort: stringify and try to find text
          const str = JSON.stringify(result).substring(0, 1000);
          console.log("Result stringified:", str);
          throw new Error(`Could not extract text. Keys: ${Object.keys(result).join(', ')}`);
        }
        
        if (!aiContent) {
          throw new Error('Empty response from model');
        }
        
        console.log(`Successfully extracted content from ${modelName}`);
        break;
      } catch (error) {
        console.warn(`Model ${modelName} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!aiContent) {
      throw new Error(
        `Failed to generate code. Last error: ${lastError?.message || 'Unknown error'}`
      );
    }

    // Extract code blocks
    const codeBlocks = extractCodeBlocks(aiContent);

    if (codeBlocks.length === 0) {
      // If no code block found, treat entire response as code
      codeBlocks.push({
        language: getLanguageFromFramework(selectedFramework),
        code: aiContent,
        description: "",
      });
    }

    res.json({
      success: true,
      code: aiContent,
      codeBlocks,
      framework: selectedFramework,
    });
  } catch (error) {
    console.error("Generate code error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate code",
    });
  }
};

// Helper function to extract code blocks from markdown
function extractCodeBlocks(content) {
  const codeBlocks = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  let componentIndex = 0;
  let lastIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[2].trim();
    let description = "";
    let componentDetails = "";

    // Try to extract component name from comments or code
    const commentMatch = code.match(/(?:\/\/|\/\*)\s*(?:Component|Component Name):\s*([^\n*]+)/i);
    if (commentMatch) {
      description = commentMatch[1].trim();
    } else {
      // Try to extract from HTML/React/Vue component definitions
      const componentMatch = code.match(
        /(?:class|function|const)\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:extends|=|\()/
      );
      if (componentMatch) {
        description = componentMatch[1];
      } else {
        // Try to extract title from h1, title attribute, or similar
        const titleMatch = code.match(/<h1[^>]*>([^<]+)<\/h1>|title[=:]\s*['"]+([^'"]+)['"]/i);
        if (titleMatch) {
          description = titleMatch[1] || titleMatch[2];
        }
      }
    }

    // Fallback to generic name if no description found
    if (!description) {
      componentIndex++;
      description = `Component ${componentIndex}`;
    }

    // Extract component details (bullet points) from text BEFORE and AFTER the code block
    // First, try to find bullet points before the code block (preferred location)
    const textBeforeCode = content.substring(Math.max(0, match.index - 1000), match.index);
    const textAfterCodeBlock = content.substring(match.index + match[0].length);
    const nextCodeBlockMatch = /```/.exec(textAfterCodeBlock);
    const nextCodeBlockIndex = nextCodeBlockMatch ? match.index + match[0].length + nextCodeBlockMatch.index : content.length;
    const textAfterCode = content.substring(match.index + match[0].length, nextCodeBlockIndex);
    
    // Extract bullet points and features (text with - or • or * or numbered lists)
    const bulletPointRegex = /^[\s]*[-•*]\s+(.+)$/gm;
    const numberedRegex = /^[\s]*\d+\.\s+(.+)$/gm;
    const detailLines = [];
    
    // Look for bullet points BEFORE the code block first (more reliable)
    let searchText = textBeforeCode;
    let bulletMatch;
    while ((bulletMatch = bulletPointRegex.exec(searchText)) !== null) {
      const bulletText = bulletMatch[1].trim();
      // Only add if it's not empty and not part of code
      if (bulletText && !bulletText.startsWith('```')) {
        detailLines.push(bulletText);
      }
    }
    
    let numberedMatch;
    while ((numberedMatch = numberedRegex.exec(searchText)) !== null) {
      const numberedText = numberedMatch[1].trim();
      if (numberedText && !numberedText.startsWith('```')) {
        detailLines.push(numberedText);
      }
    }
    
    // If no bullet points found before, look AFTER the code block
    if (detailLines.length === 0) {
      searchText = textAfterCode;
      while ((bulletMatch = bulletPointRegex.exec(searchText)) !== null) {
        const bulletText = bulletMatch[1].trim();
        if (bulletText && !bulletText.startsWith('```')) {
          detailLines.push(bulletText);
        }
      }
      
      while ((numberedMatch = numberedRegex.exec(searchText)) !== null) {
        const numberedText = numberedMatch[1].trim();
        if (numberedText && !numberedText.startsWith('```')) {
          detailLines.push(numberedText);
        }
      }
    }

    // If we found bullet points/features, use them as component details
    if (detailLines.length > 0) {
      componentDetails = detailLines.join("\n");
    } else {
      // Otherwise, try to extract descriptive text before the code block
      // Look for sentences that describe the component
      const sentencesBeforeCode = textBeforeCode.match(/([^.!?\n]+[.!?])/g);
      if (sentencesBeforeCode && sentencesBeforeCode.length > 0) {
        // Get the last 1-2 sentences before the code block
        const relevantSentences = sentencesBeforeCode.slice(-2).join(' ').trim();
        if (relevantSentences.length > 10 && relevantSentences.length < 300) {
          componentDetails = relevantSentences;
        }
      }
    }

    codeBlocks.push({
      language: match[1] || "text",
      code: code,
      description: description,
      details: componentDetails,
    });
  }

  return codeBlocks;
}

// Helper function to get language from framework
function getLanguageFromFramework(framework) {
  const languageMap = {
    "HTML + CSS": "html",
    "HTML + Tailwind CSS": "html",
    "HTML + Bootstrap": "html",
    "HTML + CSS + JS": "javascript",
    "React + Tailwind": "jsx",
    "Vue + Tailwind": "vue",
    "Angular + Bootstrap": "typescript",
    "Next.js + Tailwind": "jsx",
  };
  return languageMap[framework] || "html";
}