import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import CodeBlock from "./CodeBlock";

export default function ChatView() {
  const { "*": rest, } = useParams(); // not used if using nested routes
  // For path /chat/:id, use useParams() differently if you route that way
  const locationParts = window.location.pathname.split("/");
  const chatId = locationParts[2];

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [code, setCode] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!chatId || !token) return;
    fetch(`http://localhost:5000/api/chat/${chatId}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setMessages).catch(()=>{});
  }, [chatId]);

  useEffect(() => {
    // check latest assistant message for code
    const last = [...messages].reverse().find(m => m.role === "assistant");
    if (last && last.code) setCode(last.code);
    else setCode(null);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // optimistic add
    const temp = { role: "user", content: input, createdAt: new Date().toISOString(), _id: Date.now() };
    setMessages(prev => [...prev, temp]);
    setInput("");

    const res = await fetch(`http://localhost:5000/api/chat/${chatId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: input })
    });
    const data = await res.json();
    if (data.assistant) {
      setMessages(prev => [...prev, data.assistant]);
    }
  };

  return (
    <div className="flex-1 flex">
      <div className={`p-6 overflow-auto ${code ? "w-1/2" : "w-full"}`}>
        {messages.map(m => <MessageBubble key={m._id} message={m} />)}
      </div>

      {code && (
        <div className="w-1/2 border-l border-neutral-800 p-6 bg-neutral-900">
          <CodeBlock code={code} />
        </div>
      )}

      {/* Input fixed at bottom */}
      <div className="fixed bottom-6 left-80 right-6">
        <div className="max-w-3xl mx-auto flex gap-3 bg-neutral-900 p-3 rounded-2xl">
          <input className="flex-1 bg-transparent outline-none" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask the assistant..." />
          <button onClick={sendMessage} className="bg-orange-600 px-4 py-2 rounded-lg">Send</button>
        </div>
      </div>
    </div>
  );
}
