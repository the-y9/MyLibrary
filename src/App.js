// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import SessionSummary from "./pages/SessionSummary";
import BookSummary from "./pages/BookSummary";
import Dashboard from "./pages/Dashboard";

function App() {
  return (<>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sessions" element={<SessionSummary />} />
        <Route path="/books" element={<BookSummary />} />
      </Routes>
    </Router>
  
  </>
  );
}

export default App;
