import React from 'react';
import './Home.css';

function Home() {
    const backgroundImageStyle = {
      backgroundImage: `url(${process.env.PUBLIC_URL + '/img/exam_bg.jpg'})`, // Corrected syntax
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
    };

  return (
    <div style={backgroundImageStyle}>
      <div className="container">
        <h1>Welcome to TestMaster!</h1>
        <p>Please login to further process, for new users signup first</p>
        <a href="/signup" className="btn">Sign Up (For New Users)</a>
        <a href="/login" className="btn">Log In</a>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/organization-signup" className="btn">For Organization - Click Here</a>
        </p>
      </div>
    </div>
  );
}

export default Home;