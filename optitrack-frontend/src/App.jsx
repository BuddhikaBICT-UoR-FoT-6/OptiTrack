/**
 * App.jsx
 * Purpose: Root component for OptiTrack Frontend.
 * This will eventually house our React Router and Global Providers.
 */
function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <h1 className="text-3xl font-bold text-brand-primary mb-2">
          OptiTrack
        </h1>
        <p className="text-slate-600 mb-6">
          AI-Powered Enterprise Resource & IoT Fleet Manager scaffold is ready.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Vite + React 18 Installed
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Tailwind CSS Configured
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Zustand & STOMP.js Ready
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
