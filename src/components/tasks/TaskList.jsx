import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useTasks } from '../../hooks/useTasks';
import TaskRow from './TaskRow';
import TaskForm from './TaskForm';
import Loader from '../common/Loader';

export default function TaskList({ actionId, showAddButton = true, restrictUser, currentUserId }) {
  const { tasks: rawTasks, reorderTasks, loading, addTask } = useTasks(actionId);
  const [formOpen, setFormOpen] = useState(false);

  const tasks = useMemo(() => {
    if (!restrictUser) return rawTasks;
    return rawTasks.filter((t) => t.assignedUserId === currentUserId);
  }, [rawTasks, restrictUser, currentUserId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = tasks.map((t) => t.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(ids, oldIndex, newIndex);
    reorderTasks(actionId, newOrder);
  };

  return (
    <div className="space-y-3">
      {showAddButton ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-border-active)]"
          >
            <Plus className="h-4 w-4" />
            Task
          </button>
        </div>
      ) : null}

      {loading ? (
        <Loader inline />
      ) : restrictUser ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              actionId={actionId}
              orderedIds={ids}
              enableSort={false}
            />
          ))}
        </ul>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} actionId={actionId} orderedIds={ids} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        actionId={actionId}
        onCreate={(payload) => addTask({ ...payload, actionId })}
      />
    </div>
  );
}
