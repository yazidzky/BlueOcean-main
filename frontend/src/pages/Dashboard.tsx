import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: s } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.get("/stats");
      return res.data as {
        tasksDueToday: number;
        tasksDoneToday: number;
        tasksCompleted: number;
        tasksPending: number;
        tasksThisWeek: number;
        progressPercent: number;
        points?: number;
        streakDays?: number;
      };
    },
  });

  const { data: recentTasks = [] } = useQuery({
    queryKey: ["recentTasks"],
    queryFn: async () => {
      const res = await api.get("/tasks");
      const tasks = res.data as { _id: string; title: string; completed: boolean }[];
      return tasks.slice(0, 4);
    },
  });

  const stats = [
    { label: "Tasks Today", value: String(s?.tasksDueToday ?? 0), icon: CheckCircle2, color: "text-primary" },
    { label: "Completed", value: String(s?.tasksCompleted ?? 0), icon: CheckCircle2, color: "text-success" },
    { label: "Pending", value: String(s?.tasksPending ?? 0), icon: Clock, color: "text-muted-foreground" },
    { label: "This Week", value: String(s?.tasksThisWeek ?? 0), icon: TrendingUp, color: "text-primary-variant" },
  ];

  

  return (
    <AppLayout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what's happening with your tasks today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-6 glass-card hover-lift animate-slide-up border border-border/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="font-heading font-bold text-3xl text-foreground">
                  {stat.value}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Progress Widget */}
        <Card
          className="p-6 mb-8 glass-card border border-border/50 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-xl text-foreground mb-1">
                Today's Progress
              </h2>
              <p className="text-sm text-muted-foreground">
                You've completed {s?.progressPercent ?? 0}% of your daily tasks
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <span className="font-heading font-bold text-3xl text-primary">
                  {s?.progressPercent ?? 0}%
                </span>
                <p className="text-sm text-muted-foreground">
                  {s?.tasksDoneToday ?? 0} of {s?.tasksDueToday ?? 0} tasks
                </p>
              </div>
            </div>
          </div>
          <Progress value={s?.progressPercent ?? 0} className="h-3 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Keep going!</span>
            <span>{Math.max((s?.tasksDueToday ?? 0) - (s?.tasksDoneToday ?? 0), 0)} tasks remaining</span>
          </div>
        </Card>

        {/* Recent Tasks & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <Card
            className="lg:col-span-2 p-6 glass-card border border-border/50 animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-semibold text-xl text-foreground">
                Recent Tasks
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/tasks")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentTasks.map((task: any) => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed
                        ? "bg-success border-success"
                        : "border-muted"
                    }`}
                  >
                    {task.completed && (
                      <CheckCircle2 className="h-3 w-3 text-success-foreground" />
                    )}
                  </div>
                  <span
                    className={`flex-1 ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
            <Button
              variant="default"
              className="w-full mt-4"
              onClick={() => navigate("/tasks")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card
            className="p-6 glass-card border border-border/50 animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                variant="glass"
                className="w-full justify-start"
                onClick={() => navigate("/tasks")}
              >
                <CheckCircle2 className="h-5 w-5 mr-3" />
                Manage Tasks
              </Button>
              <Button
                variant="glass"
                className="w-full justify-start"
                onClick={() => navigate("/friends")}
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Friends
              </Button>
              <Button
                variant="glass"
                className="w-full justify-start"
                onClick={() => navigate("/chat")}
              >
                <Plus className="h-5 w-5 mr-3" />
                Start Chat
              </Button>
              <Button
                variant="glass"
                className="w-full justify-start"
                onClick={() => navigate("/profile")}
              >
                <Plus className="h-5 w-5 mr-3" />
                Edit Profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
