
import { Link } from "react-router-dom";
import { ListTodo } from "lucide-react";
import MobileLayout from "../components/layouts/MobileLayout";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import QuickActions from "../components/dashboard/QuickActions";
import { useAuth } from "../contexts/AuthContext";
import Timetable from "../components/dashboard/Timetable";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <MobileLayout title="Dashboard">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's your study overview for today</p>
        </div>

        <div className="space-y-6">
          <TodaySchedule />
          <QuickActions />
          <Timetable />
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link 
            to="/tasks" 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ListTodo className="w-4 h-4 mr-2" />
            Manage Tasks
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
