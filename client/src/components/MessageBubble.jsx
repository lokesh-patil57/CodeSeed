export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`p-4 rounded-2xl max-w-[75%] ${isUser ? "bg-purple-600 text-white" : "bg-neutral-800 text-neutral-200"}`}>
        <div style={{ whiteSpace: "pre-wrap" }}>{message.content}</div>
      </div>
    </div>
  );
}
