import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  owner?: string;
  user?: string; // legacy
  collaborators?: { user: { _id: string; name: string; email: string; avatar?: string }; status: "pending" | "accepted" | "rejected"; role?: "editor" | "viewer" }[];
}

// Helpers to normalize collaborator shape (string | { user: string | object, status?, role? })
const getCollabId = (c: any): string => {
  if (!c) return "";
  if (typeof c === "string") return c;
  const u = (c as any).user;
  if (typeof u === "string") return u;
  return u?._id || "";
};
const getCollabUserObj = (c: any): { _id: string; name?: string; email?: string; avatar?: string } | undefined => {
  if (!c || typeof c !== "object") return undefined;
  const u = (c as any).user;
  return typeof u === "object" ? u : undefined;
};
const getCollabStatus = (c: any): "pending" | "accepted" | "rejected" => {
  if (c && typeof c === "object" && (c as any).status) return (c as any).status;
  return "pending";
};
const getCollabRole = (c: any): "editor" | "viewer" | "owner" => {
  if (c && typeof c === "object" && (c as any).role) return (c as any).role;
  return "viewer";
};

const getOwnerId = (task: Task): string => {
  const o: any = (task.owner || task.user) as any;
  if (!o) return "";
  if (typeof o === "object" && o._id) return o._id;
  return String(o);
};

const canEditTask = (task: Task, meId?: string): boolean => {
  const ownerId = getOwnerId(task);
  if (ownerId && meId && ownerId === meId) return true;
  const collab = (task.collaborators || []).find((c) => getCollabId(c) === (meId || "") && getCollabStatus(c) === "accepted");
  const role = collab ? getCollabRole(collab) : "viewer";
  return role === "editor" || role === "owner";
};

export default function Tasks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
  }>({
    title: "",
    description: "",
    priority: "medium",
  });
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCollabOpen, setIsCollabOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [collabQuery, setCollabQuery] = useState("");
  const [collabResults, setCollabResults] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks(currentFilter);
  }, [currentFilter]);

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onTaskUpdated = (payload: any) => {
      const updated: Task = payload.task;
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === updated._id);
        if (exists) return prev.map((t) => (t._id === updated._id ? updated : t));
        // If current filter is shared and task is shared to me, add it
        if (
          currentFilter === "shared" &&
          (updated.collaborators || []).some((c) => getCollabId(c) === (user?._id || "") && getCollabStatus(c) !== "rejected")
        ) {
          return [updated, ...prev];
        }
        return prev;
      });
    };

    const onTaskCreated = (payload: any) => {
      const created: Task = payload.task;
      setTasks((prev) => {
        // Only add if created by me (owner) when viewing non-shared filters
        const isMine = (created.owner || created.user) === user?._id;
        if (isMine && currentFilter !== "shared") return [created, ...prev];
        return prev;
      });
    };

    const onTaskDeleted = (payload: any) => {
      const id: string = payload.taskId;
      setTasks((prev) => prev.filter((t) => t._id !== id));
    };

    const onTaskShared = (payload: any) => {
      const shared: Task = payload.task;
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === shared._id);
        if (exists) return prev.map((t) => (t._id === shared._id ? shared : t));
        if (
          currentFilter === "shared" &&
          (shared.collaborators || []).some((c) => getCollabId(c) === (user?._id || "") && getCollabStatus(c) !== "rejected")
        ) {
          return [shared, ...prev];
        }
        return prev;
      });
    };

    const onTaskUnshared = (payload: any) => {
      const id: string = payload.taskId;
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, collaborators: (t.collaborators || []).filter((c) => getCollabId(c) !== payload.userId) } : t)));
    };

    const onTaskSharedAccepted = (payload: any) => {
      const accepted: Task = payload.task;
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === accepted._id);
        if (exists) return prev.map((t) => (t._id === accepted._id ? accepted : t));
        // If accepted for me, include into list regardless of filter; filtering happens later
        const isMe = (accepted.collaborators || []).some((c) => getCollabId(c) === (user?._id || "") && getCollabStatus(c) === "accepted");
        return isMe ? [accepted, ...prev] : prev;
      });
    };

    const onTaskSharedRejected = (payload: any) => {
      const rejected: Task = payload.task;
      setTasks((prev) => prev.map((t) => (t._id === rejected._id ? rejected : t)));
    };

    socket.on("task_updated", onTaskUpdated);
    socket.on("task_created", onTaskCreated);
    socket.on("task_deleted", onTaskDeleted);
    socket.on("task_shared", onTaskShared);
    socket.on("task_unshared", onTaskUnshared);
    socket.on("task_shared_accepted", onTaskSharedAccepted);
    socket.on("task_shared_rejected", onTaskSharedRejected);

    return () => {
      socket.off("task_updated", onTaskUpdated);
      socket.off("task_created", onTaskCreated);
      socket.off("task_deleted", onTaskDeleted);
      socket.off("task_shared", onTaskShared);
      socket.off("task_unshared", onTaskUnshared);
      socket.off("task_shared_accepted", onTaskSharedAccepted);
      socket.off("task_shared_rejected", onTaskSharedRejected);
    };
  }, [currentFilter, user?._id]);

  const fetchTasks = async (filter: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks?filter=${filter}`);
      setTasks(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTask = async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}/toggle`);
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
      toast({
        title: "Task updated",
        description: "Task status changed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const openCollaborators = (task: Task) => {
    setSelectedTask(task);
    setIsCollabOpen(true);
    setCollabQuery("");
    setCollabResults([]);
  };

  const searchCollaborators = async () => {
    if (!collabQuery.trim()) return setCollabResults([]);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(collabQuery)}`);
      setCollabResults(res.data);
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to search users", variant: "destructive" });
    }
  };

  const addCollaborator = async (userId: string) => {
    if (!selectedTask) return;
    try {
      const res = await api.post(`/tasks/${selectedTask._id}/collaborators`, { userId });
      const updated = res.data as Task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      toast({ title: "Collaborator added", description: "Task shared successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to add collaborator", variant: "destructive" });
    }
  };

  const removeCollaborator = async (userId: string) => {
    if (!selectedTask) return;
    try {
      const res = await api.delete(`/tasks/${selectedTask._id}/collaborators/${userId}`);
      const updated = res.data as Task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      toast({ title: "Collaborator removed", description: "Task unshared successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to remove collaborator", variant: "destructive" });
    }
  };

  const acceptInvite = async (taskId: string) => {
    if (!user) return;
    try {
      const res = await api.put(`/tasks/${taskId}/collaborators/${user._id}/accept`);
      const updated = res.data as Task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      toast({ title: "Invitation accepted", description: "Task added to your list" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to accept", variant: "destructive" });
    }
  };

  const rejectInvite = async (taskId: string) => {
    if (!user) return;
    try {
      const res = await api.put(`/tasks/${taskId}/collaborators/${user._id}/reject`);
      const updated = res.data as Task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      toast({ title: "Invitation rejected", description: "You declined collaboration" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to reject", variant: "destructive" });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
      toast({
        title: "Task deleted",
        description: "Task removed successfully",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post("/tasks", newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: "", description: "", priority: "medium" });
      setIsDialogOpen(false);
      toast({
        title: "Task added",
        description: "New task created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editTask) return;
    if (!editTask.title.trim()) {
      toast({ title: "Error", description: "Task title is required", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        dueDate: editTask.dueDate,
        completed: editTask.completed,
      };
      const response = await api.put(`/tasks/${editTask._id}`, payload);
      const updated = response.data as Task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setIsEditOpen(false);
      toast({ title: "Task updated", description: "Task changes saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update task", variant: "destructive" });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
              Tasks
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your to-do list
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg" className="hover-lift">
                <Plus className="h-5 w-5 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">
                  Create New Task
                </DialogTitle>
                <DialogDescription>
                  Add a new task to your to-do list
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add more details..."
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate || ""}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((priority) => (
                      <Button
                        key={priority}
                        type="button"
                        variant={
                          newTask.priority === priority ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setNewTask({ ...newTask, priority })}
                        className="flex-1 capitalize"
                      >
                        {priority}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={addTask} className="w-full" variant="hero">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-4 mb-6 glass-card border border-border/50 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </Card>

        <Tabs
          defaultValue="all"
          className="animate-slide-up"
          style={{ animationDelay: "100ms" }}
          onValueChange={setCurrentFilter}
        >
          <TabsList className="mb-6 glass-card">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          </TabsList>

          {["all", "today", "completed", "overdue", "shared"].map((filter) => (
            <TabsContent key={filter} value={filter}>
              <Card className="glass-card border border-border/50">
                <div className="divide-y divide-border">
                  {loading ? (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">Loading tasks...</p>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="p-12 text-center">
                      <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                        No tasks found
                      </h3>
                      <p className="text-muted-foreground">
                        {filter === "all"
                          ? "Add your first task to get started"
                          : filter === "shared"
                          ? "No shared tasks"
                          : `No ${filter} tasks`}
                      </p>
                    </div>
                  ) : (
                    filteredTasks.map((task, index) => (
                      <div
                        key={task._id}
                        className="p-4 hover:bg-accent/30 transition-colors animate-slide-up"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => canEditTask(task, user?._id) && toggleTask(task._id)}
                            className={`mt-1 hover-lift ${!canEditTask(task, user?._id) ? "opacity-60 cursor-not-allowed" : ""}`}
                            aria-disabled={!canEditTask(task, user?._id)}
                            title={canEditTask(task, user?._id) ? "Toggle complete" : "Viewer cannot toggle"}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-6 w-6 text-success" />
                            ) : (
                              <Circle className="h-6 w-6 text-muted-foreground" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1 flex-wrap">
                              <h3
                                className={`font-semibold text-foreground ${
                                  task.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </h3>
                              <Badge
                                className={`${getPriorityColor(
                                  task.priority
                                )} text-xs`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {task.description}
                              </p>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              {task.collaborators && task.collaborators.length > 0 && (
                                <span>
                                  Shared with {task.collaborators.filter((c) => getCollabStatus(c) === "accepted").length} user(s)
                                </span>
                              )}
                              {(task.collaborators || [])
                                .filter((c) => getCollabStatus(c) === "accepted")
                                .slice(0, 4)
                                .map((c) => (
                                  <Badge key={getCollabId(c)} variant="secondary" className="text-[11px]">
                                    {getCollabUserObj(c)?.name || getCollabUserObj(c)?.email || getCollabId(c)}
                                  </Badge>
                                ))}
                              {(task.collaborators || []).filter((c) => getCollabStatus(c) === "accepted").length > 4 && (
                                <Badge variant="outline" className="text-[11px]">+{(task.collaborators || []).filter((c) => getCollabStatus(c) === "accepted").length - 4} more</Badge>
                              )}
                              {getOwnerId(task) === (user?._id || "") && (
                                <Button variant="ghost" size="sm" onClick={() => openCollaborators(task)} className="px-2">
                                  <UserPlus className="h-4 w-4 mr-1" /> Add Collaborator
                                </Button>
                              )}
                              {(task.collaborators || []).some((c) => getCollabId(c) === (user?._id || "") && getCollabStatus(c) === "pending") && (
                                <div className="flex items-center gap-2 ml-2">
                                  <Button size="sm" variant="default" onClick={() => acceptInvite(task._id)}>Accept</Button>
                                  <Button size="sm" variant="outline" onClick={() => rejectInvite(task._id)}>Reject</Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {canEditTask(task, user?._id) && (
                              <Button variant="outline" size="sm" onClick={() => openEdit(task)} title="Edit task">
                                Edit
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTask(task._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Edit Task</DialogTitle>
              <DialogDescription>Update task details</DialogDescription>
            </DialogHeader>
            {editTask && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editTask.description || ""}
                    onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editTask.dueDate ? new Date(editTask.dueDate).toISOString().slice(0, 10) : ""}
                    onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((priority) => (
                      <Button
                        key={priority}
                        type="button"
                        variant={editTask.priority === priority ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditTask({ ...editTask, priority })}
                        className="flex-1 capitalize"
                      >
                        {priority}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={saveEdit} className="w-full" variant="hero">
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Collaborator Dialog */}
        <Dialog open={isCollabOpen} onOpenChange={setIsCollabOpen}>
          <DialogContent className="glass-card border-border/50 w-[92vw] max-w-[640px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Manage Collaborators</DialogTitle>
              <DialogDescription>Share this task with friends</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="collab-search">Find users</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Input
                      id="collab-search"
                      placeholder="Search by name or email"
                      value={collabQuery}
                      onChange={(e) => setCollabQuery(e.target.value)}
                    />
                    <Button variant="default" onClick={searchCollaborators}>Search</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {collabResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No results</p>
                  ) : (
                    collabResults.map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/40 flex-wrap gap-2">
                        <div className="text-sm">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-muted-foreground">{u.email}</div>
                        </div>
                        <Button size="sm" onClick={() => addCollaborator(u._id)}>
                          Share
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                {selectedTask.collaborators && selectedTask.collaborators.length > 0 && (
                  <div className="space-y-2">
                    <Label>Current collaborators</Label>
                    <div className="space-y-2">
                      {selectedTask.collaborators.map((c) => (
                        <div key={getCollabId(c)} className="flex items-center justify-between p-2 rounded-md border flex-wrap gap-2">
                          {getCollabUserObj(c) ? (
                            <>
                              <span className="text-sm text-foreground">{getCollabUserObj(c)?.name}</span>
                              <span className="text-xs text-muted-foreground">{getCollabUserObj(c)?.email}</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">{getCollabId(c)}</span>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs capitalize">{getCollabStatus(c)}</Badge>
                            <Badge className="text-xs capitalize">{getCollabRole(c)}</Badge>
                          </div>
                          {getOwnerId(selectedTask) === (user?._id || "") && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={async () => {
                                try {
                                  const res = await api.put(`/tasks/${selectedTask._id}/collaborators/${getCollabId(c)}/role`, { role: "owner" });
                                  const updated = res.data as Task;
                                  setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
                                  const name = getCollabUserObj(c)?.name || getCollabId(c);
                                  toast({ title: "Role updated", description: `${name} is now owner` });
                                } catch (error: any) {
                                  toast({ title: "Error", description: error.response?.data?.message || "Failed to update role", variant: "destructive" });
                                }
                              }}>Make Owner</Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                try {
                                  const res = await api.put(`/tasks/${selectedTask._id}/collaborators/${getCollabId(c)}/role`, { role: "editor" });
                                  const updated = res.data as Task;
                                  setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
                                } catch (error: any) {
                                  toast({ title: "Error", description: error.response?.data?.message || "Failed to update role", variant: "destructive" });
                                }
                              }}>Make Editor</Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                try {
                                  const res = await api.put(`/tasks/${selectedTask._id}/collaborators/${getCollabId(c)}/role`, { role: "viewer" });
                                  const updated = res.data as Task;
                                  setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
                                } catch (error: any) {
                                  toast({ title: "Error", description: error.response?.data?.message || "Failed to update role", variant: "destructive" });
                                }
                              }}>Make Viewer</Button>
                            </div>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => removeCollaborator(getCollabId(c))}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Pending invite actions for me */}
                {selectedTask.collaborators && selectedTask.collaborators.some((c) => getCollabId(c) === user?._id && getCollabStatus(c) === "pending") && (
                  <div className="flex gap-2">
                    <Button onClick={() => acceptInvite(selectedTask._id)} variant="default">Accept</Button>
                    <Button onClick={() => rejectInvite(selectedTask._id)} variant="outline">Reject</Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
