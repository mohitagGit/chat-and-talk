import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatListPage from "./pages/ChatListPage";
import EditChatPage from "./pages/EditChatPage";
import ConversationPage from "./pages/ConversationPage";
import NewChatPage from "./pages/NewChatPage";
import NewGroupChatPage from "./pages/NewGroupChatPage";
import AboutPage from "./pages/AboutPage";
import CallingPage from "./pages/CallingPage";
import { NotfoundPage } from "./pages/NotfoundPage";
import { useEffect } from "react";
const currentUser = JSON.parse(localStorage.getItem("current-user"));

function App() {
  const navigate = useNavigate();

  const userSessionCheck = () => {
    if (currentUser && currentUser.id) {
      const path = window.location.pathname;
      navigate(path);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    userSessionCheck();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/chats" element={<ChatListPage />} />
        <Route path="/chats/:chatId/edit" element={<EditChatPage />} />
        <Route path="/chats/:chatId/messages" element={<ConversationPage />} />
        <Route path="/chats/:chatId/call" element={<CallingPage />} />
        <Route path="/chats/new" element={<NewChatPage />} />
        <Route path="/chats/group/new" element={<NewGroupChatPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotfoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
