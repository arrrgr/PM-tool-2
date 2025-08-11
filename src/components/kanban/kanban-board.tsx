'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';

interface Task {
  id: string;
  key: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  type: string | null;
  storyPoints: number | null;
  dueDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
}

interface KanbanBoardProps {
  tasks: Task[];
  statuses: string[];
  projectId: string;
  teamMembers: TeamMember[];
}

export function KanbanBoard({ tasks, statuses, projectId, teamMembers }: KanbanBoardProps) {
  const [items, setItems] = useState(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const router = useRouter();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeTask = items.find((task) => task.id === active.id);
    setActiveTask(activeTask || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = items.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    let newStatus = activeTask.status;

    // Check if dropped on a column
    if (statuses.includes(overId)) {
      newStatus = overId;
    } else {
      // Dropped on another task, find its status
      const overTask = items.find((task) => task.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus === activeTask.status) return;

    // Optimistically update the UI
    setItems((items) =>
      items.map((task) =>
        task.id === activeTask.id ? { ...task, status: newStatus } : task
      )
    );

    // Update the task status on the server
    try {
      const response = await fetch(`/api/tasks/${activeTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        // Revert the optimistic update on error
        setItems((items) =>
          items.map((task) =>
            task.id === activeTask.id ? { ...task, status: activeTask.status } : task
          )
        );
        throw new Error('Failed to update task status');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating task status:', error);
      // Could show a toast notification here
    }
  };

  const getTasksByStatus = (status: string) => {
    return items.filter((task) => (task.status || 'To Do') === status);
  };

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              projectId={projectId}
              teamMembers={teamMembers}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
      
      {selectedTask && (
        <EditTaskDialog
          task={{
            id: selectedTask.id,
            key: selectedTask.key,
            title: selectedTask.title,
            description: selectedTask.description,
            status: selectedTask.status,
            priority: selectedTask.priority,
            type: selectedTask.type,
            storyPoints: selectedTask.storyPoints,
            dueDate: selectedTask.dueDate,
            assigneeId: selectedTask.assignee?.id || null,
            projectId: projectId,
          }}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}