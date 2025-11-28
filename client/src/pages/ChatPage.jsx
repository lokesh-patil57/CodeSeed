import Sidebar from "../components/Sidebar";
import ChatView from "../components/ChatView";

export default function ChatPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatView />
    </div>
  );
}
