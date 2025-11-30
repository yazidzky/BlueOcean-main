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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

export default function Tasks() {
  const { toast } = useToast();
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

  useEffect(() => {
    fetchTasks(currentFilter);
  }, [currentFilter]);

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
          </TabsList>

          {["all", "today", "completed", "overdue"].map((filter) => (
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
                            onClick={() => toggleTask(task._id)}
                            className="mt-1 hover-lift"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-6 w-6 text-success" />
                            ) : (
                              <Circle className="h-6 w-6 text-muted-foreground" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
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
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(task)}>
                              Edit
                            </Button>
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
      </div>
    </AppLayout>
  );
}
