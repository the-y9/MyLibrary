// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SessionSummary from "./pages/SessionSummary";
import BookSummary from "./pages/BookSummary";

function App() {
  return (<>
    <Router>
      <nav>
        <Link to="/">Session Summary</Link> | <Link to="/books">Book Summary</Link>
      </nav>
      <Routes>
        <Route path="/sessions" element={<SessionSummary />} />
        <Route path="/books" element={<BookSummary />} />
      </Routes>
    </Router>
  <a href="https://forms.gle/AUyCFVASWgtFVJg69" target="blank">add session</a>  
  </>
  );
}

export default App;
