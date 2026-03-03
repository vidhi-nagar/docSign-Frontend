import React from "react";
import Auth from "./pages/Auth";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import { Editor } from "./pages/Editor";
import ExternalSignEditor from "./pages/ExternalSignEditor";
// import { ExternalSignEditor } from "./pages/ExternalSignEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Auth />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/sign-external/:token" element={<ExternalSignEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
