
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
      <div className="py-4">
        <TasksBreadcrumb />
        <TaskStats tasks={tasks} />

        {isLoading ? (
          <TasksLoader />
        ) : (
          <TimetableProvider>
            <TaskBoard
              tasks={tasks}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              modules={userModules}
            />
          </TimetableProvider>
        )}
      </div>
    </MobileLayout>
  );
};

export default Tasks;
