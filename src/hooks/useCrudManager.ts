import { useState, useEffect } from "react";

interface CrudEditing {
  id?: string;
}

export function useCrudManager<T extends { id: string; sort_order?: number | null }, E extends CrudEditing>(
  sourceItems: T[],
  buildItem: (editing: E, items: T[]) => T,
) {
  const [items, setItems] = useState<T[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<E | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (sourceItems.length > 0) {
      setItems([...sourceItems]);
    }
  }, [sourceItems]);

  const handleAdd = (template: E) => {
    setEditing(template);
    setDialogOpen(true);
  };

  const handleEdit = (item: T, transform: (item: T) => E) => {
    setEditing(transform(item));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    const newItem = buildItem(editing, items);
    if (editing.id && items.some(i => i.id === editing.id)) {
      setItems(prev => prev.map(i => i.id === editing.id ? newItem : i));
    } else {
      setItems(prev => [...prev, newItem]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleteConfirmId(null);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    setItems(prev => {
      const newList = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newList.length) return prev;
      [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
      return newList.map((item, i) => ({ ...item, sort_order: i }));
    });
  };

  const changed = JSON.stringify(items) !== JSON.stringify(sourceItems);

  return {
    items, setItems,
    dialogOpen, setDialogOpen,
    editing, setEditing,
    deleteConfirmId, setDeleteConfirmId,
    changed,
    handleAdd, handleEdit, handleSave,
    handleDelete, handleMove,
  };
}
