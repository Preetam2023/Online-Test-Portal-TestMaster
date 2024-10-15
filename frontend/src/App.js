import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import OrgAdminSignup from './components/OrgAdminSignup';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} /> {/* Create the Signup component later */}
        <Route path="/login" element={<Login />} /> {/* Create the Login component later */}
        <Route path="/organization-admin-signup" element={<OrgAdminSignup />} /> {/* Create OrgAdminSignup component later */}
      </Routes>
    </Router>
  );
}

export default App;
