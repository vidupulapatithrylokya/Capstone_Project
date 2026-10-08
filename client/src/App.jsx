// client/src/App.jsx
import React, { useState } from "react";
import JSConceptsDemo from "./components/common/JSConceptsDemo";
import { useAppStore } from "./store/useAppStore";

function App() {
  const { user, token, setUser, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState("ai");

  // AI Chat & Agent State
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [toolsUsed, setToolsUsed] = useState([]);
  const [sources, setSources] = useState([]);
  const [executionLogs, setExecutionLogs] = useState([]);

  // Payment Modal State
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Handle Single-Turn AI Request or Multi-Step Agent Workflow
  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setAiResponse("");
    setStreamingText("");
    setToolsUsed([]);
    setSources([]);
    setExecutionLogs([]);

    const endpoint = isAgentMode ? "/api/ai/agent" : "/api/ai/ask";

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      setAiResponse(data.data.response);
      setToolsUsed(data.data.toolsUsed || []);
      setSources(data.data.sources || []);
      setExecutionLogs(data.data.executionLogs || []);
    } catch (err) {
      setAiResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle SSE Real-Time Streaming
  const handleStreamAI = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setAiResponse("");
    setStreamingText("");

    try {
      const res = await fetch("http://localhost:5000/api/ai/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ prompt }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n\n");

        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.replace("data: ", ""));
              if (parsed.chunk) {
                accumulated += parsed.chunk;
                setStreamingText(accumulated);
              }
              if (parsed.sources) {
                setSources(parsed.sources);
              }
            } catch (err) {}
          }
        });
      }
    } catch (err) {
      setStreamingText(`Streaming Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Stripe Payment Demo
  const handlePaymentDemo = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 49.99, courseTitle: "ExplainAI Premium Masterclass" }),
      });
      const data = await res.json();

      // Confirm payment in SQL DB
      const confirmRes = await fetch("http://localhost:5000/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.sessionId, amount: 49.99, courseTitle: "ExplainAI Premium Masterclass" }),
      });
      const confirmData = await confirmRes.json();
      setPaymentStatus(confirmData.message || "Payment completed.");
    } catch (err) {
      setPaymentStatus(`Payment Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B17] text-white font-sans antialiased">
      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-[#0d1024] px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-xl text-white shadow-md">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
              ExplainAI
            </h1>
            <p className="text-xs text-gray-400">Interactive Learning & Agentic Engine</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-[#15192d] p-1.5 rounded-xl border border-gray-800">
          {[
            { id: "ai", label: "AI Assistant & Agent" },
            { id: "courses", label: "Courses (SSR)" },
            { id: "payments", label: "Stripe & Relational SQL" },
            { id: "js-engine", label: "JS Engine & Concepts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition duration-150 ${
                activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg">
          Role: <strong className="text-cyan-400">Student / Admin</strong>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* TAB 1: AI ASSISTANT & AGENT */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="bg-[#15192d] border border-[#282f4d] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-400">AI Learning Assistant & Multi-Step Agent</h2>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAgentMode}
                      onChange={(e) => setIsAgentMode(e.target.checked)}
                      className="rounded border-gray-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    Enable Multi-Step Agent Workflow
                  </label>
                </div>
              </div>

              <form onSubmit={handleAskAI} className="space-y-4">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask any educational question or try: 'Calculate 125 * 8' or 'Search course Artificial Intelligence'"
                  className="w-full bg-[#090b17] border border-gray-800 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold transition shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Processing..." : isAgentMode ? "Run Multi-Step Agent" : "Ask AI"}
                  </button>

                  <button
                    type="button"
                    onClick={handleStreamAI}
                    disabled={loading}
                    className="px-6 py-2.5 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-xs font-semibold transition shadow-lg disabled:opacity-50"
                  >
                    Stream SSE Response
                  </button>
                </div>
              </form>
            </div>

            {/* AI Response Box */}
            {(aiResponse || streamingText) && (
              <div className="bg-[#15192d] border border-[#282f4d] rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Response Output</h3>
                <div className="bg-[#090b17] p-5 rounded-xl border border-gray-800 text-sm whitespace-pre-wrap leading-relaxed text-gray-200">
                  {streamingText || aiResponse}
                </div>

                {/* Metadata & Tools */}
                {toolsUsed.length > 0 && (
                  <div className="flex gap-2 items-center text-xs text-yellow-400 bg-yellow-950/30 p-3 rounded-lg border border-yellow-900/50">
                    <strong>Tools Invoked:</strong> {toolsUsed.join(", ")}
                  </div>
                )}

                {sources.length > 0 && (
                  <div className="text-xs text-cyan-300 bg-cyan-950/30 p-3 rounded-lg border border-cyan-900/50">
                    <strong>RAG Grounded Sources:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {sources.map((s, idx) => (
                        <li key={idx}>
                          {s.title} (Relevance Score: {s.relevanceScore})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COURSES SSR */}
        {activeTab === "courses" && (
          <div className="bg-[#15192d] border border-[#282f4d] rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-blue-400">Server-Side Rendered (SSR) Course Catalog</h2>
            <p className="text-sm text-gray-400">
              The ExplainAI catalog is rendered directly on the Express server at <code className="text-cyan-300">/ssr/courses</code>.
            </p>
            <div className="mt-4">
              <iframe
                src="http://localhost:5000/ssr/courses"
                title="SSR Course Catalog"
                className="w-full h-96 border border-gray-800 rounded-xl bg-[#090b17]"
              />
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS & RELATIONAL SQL */}
        {activeTab === "payments" && (
          <div className="bg-[#15192d] border border-[#282f4d] rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-blue-400">Stripe Payment Gateway & Relational SQL Storage</h2>
            <p className="text-sm text-gray-400">
              Transactions use normalized 3NF relational schemas with ACID guarantees, primary/foreign keys, and audit logging.
            </p>

            <button
              onClick={handlePaymentDemo}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-xs shadow-lg transition"
            >
              Simulate Stripe Checkout & Relational SQL Transaction
            </button>

            {paymentStatus && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-300 text-sm">
                {paymentStatus}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: JS ENGINE CONCEPTS */}
        {activeTab === "js-engine" && <JSConceptsDemo />}
      </main>
    </div>
  );
}

export default App;