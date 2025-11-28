import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // fetch chats
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    fetch("http://localhost:5000/api/chat/list", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setChats).catch(()=>{});
  }, []);

  const newChat = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/chat/new", {
      method: "POST", headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "New Chat" })
    });
    const chat = await res.json();
    navigate(`/chat/${chat._id}`);
  };

  return (
    <div className="w-72 bg-neutral-950 border-r border-neutral-800 p-4 flex flex-col">
      <button onClick={newChat} className="bg-neutral-800 text-white p-3 rounded-md mb-4">+ New Chat</button>
      <div className="text-neutral-500 text-sm mb-2">Recent</div>
      <div className="flex-1 overflow-auto space-y-2">
        {chats.map(c => (
          <Link key={c._id} to={`/chat/${c._id}`} className="block p-2 rounded hover:bg-neutral-900">{c.title}</Link>
        ))}
      </div>
    </div>
  );
}
