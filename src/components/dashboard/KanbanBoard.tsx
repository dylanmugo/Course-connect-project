
import { useState, useRef, useEffect } from "react";
import KanbanColumn from "./KanbanColumn";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  module?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

interface KanbanBoardProps {
  tasks: {
    todo: Task[];
    "in-progress": Task[];
    completed: Task[];
  };
  onTaskMove: (taskId: string, newStatus: "todo" | "in-progress" | "completed") => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const KanbanBoard = ({ tasks, onTaskMove, onEditTask, onDeleteTask }: KanbanBoardProps) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [hoveringColumn, setHoveringColumn] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const touchY = useRef<number | null>(null);

  // Clear any auto-scroll interval when component unmounts
  useEffect(() => {
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, []);

  // Handle auto-scrolling when dragging near edges
  const startAutoScroll = (direction: 'up' | 'down') => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
    
    autoScrollInterval.current = setInterval(() => {
      if (boardRef.current) {
        boardRef.current.scrollBy({
          top: direction === 'up' ? -10 : 10,
          behavior: 'smooth'
        });
      }
    }, 20);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    setDraggingTaskId(taskId);
    
    // For better mobile drag visualization
    if (e.target instanceof HTMLElement) {
      const clone = e.target.cloneNode(true) as HTMLElement;
      clone.style.opacity = '0.6';
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, 0, 0);
      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
    
    // Add a slight delay for visual effect
    setTimeout(() => {
      const element = document.getElementById(`task-${taskId}`);
      if (element) {
        element.classList.add("dragging");
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingTaskId(null);
    setHoveringColumn(null);
    stopAutoScroll();
    
    const elements = document.querySelectorAll(".dragging");
    elements.forEach(el => el.classList.remove("dragging"));
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setHoveringColumn(columnId);
    
    // Auto-scroll when dragging near the top or bottom of the container
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const scrollThreshold = 50; // Pixels from edge to trigger auto-scroll
      
      if (e.clientY - boardRect.top < scrollThreshold) {
        startAutoScroll('up');
      } else if (boardRect.bottom - e.clientY < scrollThreshold) {
        startAutoScroll('down');
      } else {
        stopAutoScroll();
      }
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: "todo" | "in-progress" | "completed") => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    onTaskMove(taskId, columnId);
    setHoveringColumn(null);
    stopAutoScroll();
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    touchY.current = e.touches[0].clientY;
    // We'll delay setting the dragging state to avoid triggering it on simple taps
    setTimeout(() => {
      if (touchY.current !== null) {
        setDraggingTaskId(taskId);
        const element = document.getElementById(`task-${taskId}`);
        if (element) {
          element.classList.add("touch-dragging");
        }
      }
    }, 200);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingTaskId && touchY.current !== null) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchY.current;
      
      // Auto-scroll logic for touch
      if (boardRef.current) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const scrollThreshold = 80; // Larger threshold for touch
        
        if (currentY - boardRect.top < scrollThreshold) {
          boardRef.current.scrollBy({ top: -5, behavior: 'smooth' });
        } else if (boardRect.bottom - currentY < scrollThreshold) {
          boardRef.current.scrollBy({ top: 5, behavior: 'smooth' });
        }
      }
      
      // Determine which column we're hovering over based on elements under the touch point
      const elementsAtPoint = document.elementsFromPoint(
        e.touches[0].clientX, 
        e.touches[0].clientY
      );
      
      for (const element of elementsAtPoint) {
        if (element.classList.contains('kanban-column')) {
          const columnId = element.getAttribute('data-column-id');
          if (columnId) {
            setHoveringColumn(columnId);
            break;
          }
        }
      }
      
      touchY.current = currentY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, taskId: string) => {
    if (draggingTaskId === taskId && hoveringColumn) {
      // Only move if we have a valid target column
      onTaskMove(taskId, hoveringColumn as "todo" | "in-progress" | "completed");
    }
    
    touchY.current = null;
    setDraggingTaskId(null);
    setHoveringColumn(null);
    
    const elements = document.querySelectorAll(".touch-dragging");
    elements.forEach(el => el.classList.remove("touch-dragging"));
  };

  const handleDeleteClick = (taskId: string) => {
    setDeleteTaskId(taskId);
  };

  const handleConfirmDelete = () => {
    if (deleteTaskId) {
      onDeleteTask(deleteTaskId);
      setDeleteTaskId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTaskId(null);
  };

  return (
    <div 
      ref={boardRef}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 overflow-y-auto max-h-[calc(100vh-220px)]"
    >
      <KanbanColumn
        title="To Do"
        count={tasks.todo.length}
        status="todo"
        tasks={tasks.todo}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, "todo")}
        onDrop={(e) => handleDrop(e, "todo")}
        onEditTask={onEditTask}
        onDeleteTask={handleDeleteClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        isHighlighted={hoveringColumn === "todo" && draggingTaskId !== null}
      />

      <KanbanColumn
        title="In Progress"
        count={tasks["in-progress"].length}
        status="in-progress"
        tasks={tasks["in-progress"]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, "in-progress")}
        onDrop={(e) => handleDrop(e, "in-progress")}
        onEditTask={onEditTask}
        onDeleteTask={handleDeleteClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        isHighlighted={hoveringColumn === "in-progress" && draggingTaskId !== null}
      />

      <KanbanColumn
        title="Done"
        count={tasks.completed.length}
        status="completed"
        tasks={tasks.completed}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, "completed")}
        onDrop={(e) => handleDrop(e, "completed")}
        onEditTask={onEditTask}
        onDeleteTask={handleDeleteClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        isHighlighted={hoveringColumn === "completed" && draggingTaskId !== null}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTaskId !== null} onOpenChange={handleCancelDelete}>
        <AlertDialogContent className="max-w-sm md:max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete or Archive Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to archive this task for later reference or permanently delete it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <Button 
              variant="outline" 
              className="flex items-center gap-1 w-full sm:w-auto"
              onClick={handleConfirmDelete}
            >
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </Button>
            <AlertDialogAction 
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
              onClick={handleConfirmDelete}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KanbanBoard;
