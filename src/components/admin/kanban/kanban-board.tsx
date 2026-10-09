"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  badge?: string;
  badgeColor?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onMove: (itemId: string, newStatus: string) => void;
  onItemClick?: (item: KanbanItem) => void;
}

function SortableCard({
  item,
  onClick,
}: {
  item: KanbanItem;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "cursor-grab rounded-lg border bg-card p-3 shadow-sm active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <p className="text-sm font-medium">{item.title}</p>
      {item.subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
      )}
      {item.badge && (
        <Badge variant="outline" className={cn("mt-2 text-xs", item.badgeColor)}>
          {item.badge}
        </Badge>
      )}
    </div>
  );
}

export function KanbanBoard({ columns, items, onMove, onItemClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeItem = items.find((i) => i.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const itemId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find((c) => c.id === overId);
    if (targetColumn) {
      onMove(itemId, targetColumn.id);
      return;
    }

    const overItem = items.find((i) => i.id === overId);
    if (overItem) {
      onMove(itemId, overItem.status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnItems = items.filter((i) => i.status === column.id);
          return (
            <div key={column.id} className="min-w-[280px] flex-1">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>{column.title}</span>
                    <Badge variant="secondary">{columnItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SortableContext
                    id={column.id}
                    items={columnItems.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 min-h-[200px]">
                      {columnItems.map((item) => (
                        <SortableCard
                          key={item.id}
                          item={item}
                          onClick={() => onItemClick?.(item)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeItem && (
          <div className="rounded-lg border bg-card p-3 shadow-lg">
            <p className="text-sm font-medium">{activeItem.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
