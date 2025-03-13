import { Link } from "react-router-dom";
import { ListTodo } from "lucide-react";
import MobileLayout from "../components/layouts/MobileLayout";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import QuickActions from "../components/dashboard/QuickActions";
import Timetable from "../components/dashboard/Timetable";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <MobileLayout title="Dashboard">
      {/* Outer container with increased padding and a light background */}
      <div className="px-6 py-8 bg-gray-50 min-h-screen">
        {/* Welcome card with a white background, shadow, and rounded corners */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h2>
          <p className="text-gray-500">Here's your study overview for today</p>
        </div>

        {/* Dashboard sections inside card-like containers */}
        <div className="space-y-8">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <TodaySchedule />
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <QuickActions />
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <Timetable />
          </div>
        </div>

        {/* Navigation link styled as a modern button */}
        <div className="mt-12 flex justify-center">
          <Link
            to="/tasks"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg"
          >
            <ListTodo className="w-5 h-5 mr-3" />
            Manage Tasks
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
