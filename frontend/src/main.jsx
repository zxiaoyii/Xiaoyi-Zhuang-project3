import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Games from "./pages/Games.jsx";
import GamePage from "./pages/GamePage.jsx";
import Rules from "./pages/Rules.jsx";
import Scores from "./pages/Scores.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Custom from "./pages/Custom.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <Layout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "games", element: <Games /> },
      { path: "game/:id", element: <GamePage /> },
      { path: "rules", element: <Rules /> },
      { path: "scores", element: <Scores /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "custom", element: <Custom /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
