"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LocationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    fetchHistory();
  }, []);
  
  async function fetchHistory() {
    try {
      const res = await fetch("/api/auth/location");
      const data = await res.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Location History</h1>
        
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No location history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((loc, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      📍 {loc.lat}, {loc.lng}
                    </p>
                    {loc.address && (
                      <p className="text-sm text-gray-600 mt-1">{loc.address}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(loc.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}