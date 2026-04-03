import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { useSocket } from "@/hooks/useSocket";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { alerts: liveAlerts } = useSocket();
  const { token } = useAuth();

  // 📥 Fetch alerts from backend
  useEffect(() => {
  if (token) {
    fetchAlerts();
  }
}, [token]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(
  "http://localhost:5000/api/alerts",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Failed to fetch alerts");
    }

    setLoading(false);
  };

  // 🔥 Merge real-time alerts
  useEffect(() => {
    if (liveAlerts.length === 0) return;

    setAlerts((prev) => [...liveAlerts, ...prev]);
  }, [liveAlerts]);

  // ✅ Mark as read
  const markAsRead = async (id) => {
    try {
      await axios.put(
  `http://localhost:5000/api/alerts/${id}/read`,
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, isRead: true } : a
        )
      );
    } catch (err) {
      console.error("Failed to mark alert");
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <h1 className="text-2xl font-bold text-[#1A1A2E]">
          Alerts
        </h1>

        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500">No alerts</p>
          </div>
        ) : (
          <div className="space-y-3">

            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  alert.isRead
                    ? "bg-gray-50 border-gray-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                {/* Icon */}
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1A2E]">
                    {alert.message}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Action */}
                {!alert.isRead && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}

          </div>
        )}

      </div>
    </Layout>
  );
}