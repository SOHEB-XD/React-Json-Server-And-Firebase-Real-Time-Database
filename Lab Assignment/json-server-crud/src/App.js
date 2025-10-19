// src/App.js
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import UserCRUD from './UserCRUD';
import FirebaseCRUD from './FirebaseCRUD';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = React.useState('json-server');

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="app-header">
          <h1>React API Integration Demo</h1>
          <nav className="tab-navigation">
            <button 
              className={activeTab === 'json-server' ? 'active' : ''}
              onClick={() => setActiveTab('json-server')}
            >
              JSON Server CRUD
            </button>
            <button 
              className={activeTab === 'firebase' ? 'active' : ''}
              onClick={() => setActiveTab('firebase')}
            >
              Firebase Auth & CRUD
            </button>
          </nav>
        </header>

        <main className="app-main">
          {activeTab === 'json-server' && <UserCRUD />}
          {activeTab === 'firebase' && <FirebaseCRUD />}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;