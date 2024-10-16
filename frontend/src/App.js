import "./App.css";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatListPage from "./pages/ChatListPage";
import EditChatPage from "./pages/EditChatPage";
import ConversationPage from "./pages/ConversationPage";
import NewChatPage from "./pages/NewChatPage";
import NewGroupChatPage from "./pages/NewGroupChatPage";
import AboutPage from "./pages/AboutPage";
import VideoCallPage from "./pages/VideoCallPage";
import AudioCallPage from "./pages/AudioCallPage";
import { NotfoundPage } from "./pages/NotfoundPage";
import { useEffect } from "react";
import ProtectedRoute from "./routes/ProtectedRoutes";

function App() {
  useEffect(() => {
    // userSessionCheck();
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <ChatListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/:chatId/edit"
              element={
                <ProtectedRoute>
                  <EditChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/:chatId/messages"
              element={
                <ProtectedRoute>
                  <ConversationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/call/:chatId/video"
              element={
                <ProtectedRoute>
                  <VideoCallPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/call/:chatId/audio"
              element={
                <ProtectedRoute>
                  <AudioCallPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/new"
              element={
                <ProtectedRoute>
                  <NewChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/group/new"
              element={
                <ProtectedRoute>
                  <NewGroupChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotfoundPage />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
