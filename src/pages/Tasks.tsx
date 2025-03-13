import React from "react";
import MobileLayout from "../components/layouts/MobileLayout";
import TaskBoard from "../components/dashboard/TaskBoard";
import { TimetableProvider } from "../contexts/TimetableContext";
import { useTasks } from "../hooks/useTasks";
import TaskStats from "../components/dashboard/TaskStats";
import TasksBreadcrumb from "../components/dashboard/TasksBreadcrumb";
import TasksLoader from "../components/dashboard/TasksLoader";

const Tasks: React.FC = () => {
  const {
    tasks,
    userModules,
    isLoading,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask
  } = useTasks();

  return (
    <MobileLayout title="Tasks">
      <div className="py-4 px-4">
        {/* Breadcrumb navigation for better context */}
        <TasksBreadcrumb />
        
        {/* Card-like container for task stats with subtle shadow */}
        <div className="bg-white rounded-lg shadow-sm p-4 my-4">
          <TaskStats tasks={tasks} />
        </div>

        {/* Conditional rendering for loader vs. task board */}
        {isLoading ? (
          <TasksLoader />
        ) : (
          <TimetableProvider>
            {/* Updated TaskBoard container with spacing and background */}
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <TaskBoard
                tasks={tasks}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                modules={userModules}
              />
            </div>
          </TimetableProvider>
        )}
      </div>
    </MobileLayout>
  );
};

export default Tasks;
