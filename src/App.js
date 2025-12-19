// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SessionSummary from "./pages/SessionSummary";
import BookSummary from "./pages/BookSummary";
import Dashboard from "./pages/Dashboard";
import Tests from "./pages/Tests";
import Syllabus from "./pages/Syllabus"

function App() {
  return (<>
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sessions" element={<SessionSummary />} />
        <Route path="/books" element={<BookSummary />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/syllabus" element={<Syllabus />} />
      </Routes>
    </Router>
  
  </>
  );
}

export default App;
