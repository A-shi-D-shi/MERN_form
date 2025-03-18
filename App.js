import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserForm from './userForm';
import SubmissionSuccess from './submissionSuccess';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route path="/success/:id" element={<SubmissionSuccess />} />
        </Routes>
      </div>
    </Router>
  );
  
}
export default App;