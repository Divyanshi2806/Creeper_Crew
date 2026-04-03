import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
    } catch (err) {
      console.error("Failed to load admin dashboard");
    }
  };

  if (!data) return <Layout>Loading...</Layout>;

  const { stats, classStats, teacherWorkloads } = data;

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <h1 className="text-2xl font-bold text-[#1A1A2E]">
          Admin Dashboard
        </h1>

        {/* 🔥 Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat title="Teachers" value={stats.totalTeachers} />
          <Stat title="Students" value={stats.totalStudents} />
          <Stat title="Classes" value={stats.totalClasses} />
          <Stat title="Attendance" value={`${stats.schoolAttendanceRate}%`} />
        </div>

        {/* 📊 Class Performance */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Class Performance</h2>

          {classStats.map((c) => (
            <div key={c.id} className="flex justify-between py-2 border-b">
              <span>{c.name}</span>
              <span>{c.avgGrade}%</span>
            </div>
          ))}
        </div>

        {/* 👩‍🏫 Teacher Workload */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Teacher Workload</h2>

          {teacherWorkloads.map((t) => (
            <div key={t.id} className="border-b py-2">
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-gray-500">
                {t.subject} | {t.classCount} classes | {t.studentCount} students | {t.periodCount} periods
              </p>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}

// Small reusable stat component
function Stat({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}