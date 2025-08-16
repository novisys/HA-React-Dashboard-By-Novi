// Point d'entrée principal de l'application
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Styles globaux de base
const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #f5f5f7;
  }

  #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

// Injecter les styles globaux
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

// Monter l'application React
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)