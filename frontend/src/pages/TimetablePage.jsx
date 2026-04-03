import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function TimetablePage() {
  const { token } = useAuth()
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
  if (token) fetchTimetable();
}, [token]);

  const fetchTimetable = async () => {
    try {
      const res = await axios.get(
  "http://localhost:5000/api/timetable",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      setTimetable(res.data.timetable);
    } catch (err) {
      console.error("Failed to fetch timetable");
    }
  };

  // Group by day
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <h1 className="text-2xl font-bold text-[#1A1A2E]">
          Timetable
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {days.map((day) => (
            <div key={day} className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-3">{day}</h2>

              <div className="space-y-2">
                {timetable
                  .filter((t) => t.day === day)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className="p-2 bg-purple-100 rounded"
                    >
                      <p className="text-sm font-medium">
                        {slot.subject}
                      </p>
                      <p className="text-xs text-gray-600">
                        {slot.class.name}
                      </p>
                      <p className="text-xs">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}

        </div>

      </div>
    </Layout>
  );
}