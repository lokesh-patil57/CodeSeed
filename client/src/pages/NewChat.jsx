import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Chat() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-4">💬 Welcome to Chat Page!</h1>
      <p>You’re logged in securely with OTP authentication.</p>
    </div>
  );
}

export default Chat;
