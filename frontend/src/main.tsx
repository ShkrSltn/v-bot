import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Layout } from "@/pages/Layout";
import { ChatHistory } from "@/pages/ChatHistory";
import Analytics from "@/pages/Analytics";
import Questions from "@/pages/Questions";

const router = createBrowserRouter([
  {
    path: "/admin-panel",
    element: <Layout />,
    children: [
      {
        path: "/admin-panel/questions",
        element: <Questions />,
      },
      {
        path: "/admin-panel/analytics",
        element: <Analytics />,
      },
      {
        path: "/admin-panel/chat-history",
        element: <ChatHistory />,
      },
      {
        path: "/admin-panel",
        element: <Questions />,
      },
    ],
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Questions />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
