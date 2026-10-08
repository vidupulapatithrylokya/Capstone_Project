// client/src/components/common/JSConceptsDemo.jsx
import React, { useState, useEffect } from "react";
import { demonstrateEventLoop, explainHoistingRules, fetchDataWithAsyncAwait } from "../../utils/jsConceptsDemo";

export default function JSConceptsDemo() {
  const [eventLoopLogs, setEventLoopLogs] = useState([]);
  const [hoistingInfo, setHoistingInfo] = useState(null);
  const [asyncData, setAsyncData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHoistingInfo(explainHoistingRules());
  }, []);

  const handleRunEventLoopDemo = async () => {
    setLoading(true);
    const logs = await demonstrateEventLoop();
    setEventLoopLogs(logs);
    const data = await fetchDataWithAsyncAwait("crs-101");
    setAsyncData(data);
    setLoading(false);
  };

  return (
    <div className="bg-[#15192d] border border-[#282f4d] rounded-2xl p-6 text-white max-w-4xl mx-auto my-8 shadow-xl">
      <h2 className="text-2xl font-bold text-blue-400 mb-4 border-b border-gray-700 pb-2">
        JavaScript Engineering & Engine Concepts Demo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Closures & Hoisting */}
        <div className="bg-[#090b17] p-4 rounded-xl border border-gray-800">
          <h3 className="font-semibold text-purple-400 mb-2">1. Hoisting & Closures</h3>
          {hoistingInfo && (
            <ul className="text-sm space-y-2 text-gray-300">
              <li><strong className="text-blue-300">Fn Hoisting:</strong> {hoistingInfo.functionHoisting}</li>
              <li><strong className="text-blue-300">var Hoisting:</strong> {hoistingInfo.varHoisting}</li>
              <li><strong className="text-blue-300">let/const TDZ:</strong> {hoistingInfo.letConstTDZ}</li>
            </ul>
          )}
        </div>

        {/* Event Loop & Async/Await */}
        <div className="bg-[#090b17] p-4 rounded-xl border border-gray-800">
          <h3 className="font-semibold text-emerald-400 mb-2">2. Event Loop & Microtasks</h3>
          <button
            onClick={handleRunEventLoopDemo}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition duration-150 mb-3"
          >
            {loading ? "Running Event Loop..." : "Execute Event Loop Demo"}
          </button>

          {eventLoopLogs.length > 0 && (
            <div className="text-xs font-mono space-y-1 bg-gray-950 p-3 rounded text-green-400 border border-gray-800">
              {eventLoopLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          )}

          {asyncData && (
            <div className="mt-3 text-xs text-cyan-300 bg-gray-900 p-2 rounded">
              Fetched via Async/Await: <strong>{asyncData.title}</strong> ({asyncData.method})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
