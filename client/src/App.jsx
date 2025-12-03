import React from "react";
import { Routes, Route } from "react-router-dom";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { ToastContainer, toast } from 'react-toastify'; 

function App() {
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;
