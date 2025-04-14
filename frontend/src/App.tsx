import { Routes, Route, Navigate } from "react-router-dom"
import ChatbotUI from "./pages/Chatbot"
import { ChatHistory } from "./pages/ChatHistory"
import Questions from "./pages/Questions"
import Analytics from "./pages/Analytics"
import { Layout } from "./pages/Layout"

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatbotUI />} />
      <Route path="/admin-panel" element={<Layout />}>
        <Route index element={<Navigate to="questions" replace />} />
        <Route path="questions" element={<Questions />} />
        <Route path="chat-history" element={<ChatHistory />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}

export default App