// App.tsx - Dashboard complet avec API REST et drag & drop
import React from 'react';
import { DashboardGrid } from './components/Dashboard/DashboardGrid';

function App() {
  return (
    <div className="app">
      <DashboardGrid dashboardId="home-dashboard" />
      
      <style jsx global>{`
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
          overflow: hidden;
        }

        .app {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        /* Styles pour les boutons globaux */
        button {
          font-family: inherit;
        }

        button:focus {
          outline: 2px solid #1fb8cd;
          outline-offset: 2px;
        }

        /* Styles pour les inputs */
        input:focus,
        select:focus,
        textarea:focus {
          outline: 2px solid #1fb8cd;
          outline-offset: 2px;
        }

        /* Animations globales */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        /* Styles pour les toasts/notifications */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
        }

        .notification.error {
          background: #dc3545;
        }

        .notification.warning {
          background: #ffc107;
          color: #212529;
        }

        .notification.info {
          background: #1fb8cd;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
        }

        /* Dark mode support (préparé pour le futur) */
        @media (prefers-color-scheme: dark) {
          body {
            background: #1a1a1a;
            color: #ffffff;
          }
        }

        /* Focus visible pour l'accessibilité */
        .focus-visible {
          outline: 2px solid #1fb8cd;
          outline-offset: 2px;
        }

        /* États de chargement */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Transitions fluides */
        .transition-all {
          transition: all 0.2s ease-in-out;
        }

        .transition-colors {
          transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
        }

        .transition-transform {
          transition: transform 0.2s ease-in-out;
        }

        /* États hover pour les éléments interactifs */
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }

        /* Grid helpers */
        .grid-auto {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flex-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Text helpers */
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .text-center {
          text-align: center;
        }

        .text-left {
          text-align: left;
        }

        .text-right {
          text-align: right;
        }

        /* Color helpers */
        .text-primary {
          color: #1fb8cd;
        }

        .text-secondary {
          color: #6c757d;
        }

        .text-success {
          color: #28a745;
        }

        .text-danger {
          color: #dc3545;
        }

        .text-warning {
          color: #ffc107;
        }

        .text-muted {
          color: #6c757d;
        }

        /* Background helpers */
        .bg-primary {
          background-color: #1fb8cd;
        }

        .bg-secondary {
          background-color: #6c757d;
        }

        .bg-success {
          background-color: #28a745;
        }

        .bg-danger {
          background-color: #dc3545;
        }

        .bg-warning {
          background-color: #ffc107;
        }

        .bg-light {
          background-color: #f8f9fa;
        }

        .bg-dark {
          background-color: #343a40;
        }

        /* Spacing helpers */
        .m-0 { margin: 0; }
        .m-1 { margin: 0.25rem; }
        .m-2 { margin: 0.5rem; }
        .m-3 { margin: 1rem; }
        .m-4 { margin: 1.5rem; }
        .m-5 { margin: 3rem; }

        .p-0 { padding: 0; }
        .p-1 { padding: 0.25rem; }
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 1rem; }
        .p-4 { padding: 1.5rem; }
        .p-5 { padding: 3rem; }

        /* Border helpers */
        .border {
          border: 1px solid #dee2e6;
        }

        .border-0 {
          border: 0;
        }

        .border-top {
          border-top: 1px solid #dee2e6;
        }

        .border-bottom {
          border-bottom: 1px solid #dee2e6;
        }

        .border-left {
          border-left: 1px solid #dee2e6;
        }

        .border-right {
          border-right: 1px solid #dee2e6;
        }

        .rounded {
          border-radius: 0.25rem;
        }

        .rounded-lg {
          border-radius: 0.5rem;
        }

        .rounded-xl {
          border-radius: 1rem;
        }

        .rounded-full {
          border-radius: 50%;
        }

        /* Shadow helpers */
        .shadow-sm {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        .shadow {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .shadow-lg {
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
        }

        .shadow-none {
          box-shadow: none;
        }

        /* Position helpers */
        .position-relative {
          position: relative;
        }

        .position-absolute {
          position: absolute;
        }

        .position-fixed {
          position: fixed;
        }

        .position-sticky {
          position: sticky;
        }

        /* Display helpers */
        .d-none {
          display: none;
        }

        .d-block {
          display: block;
        }

        .d-inline {
          display: inline;
        }

        .d-inline-block {
          display: inline-block;
        }

        .d-flex {
          display: flex;
        }

        .d-grid {
          display: grid;
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;