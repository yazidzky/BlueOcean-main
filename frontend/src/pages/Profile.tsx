import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Mail,
  User,
  TrendingUp,
  CheckCircle,
  Flame,
} from "lucide-react";

export default function Profile() {
  const { user, setUserData } = useAuth();
  const { toast } = useToast();
  const { id } = useParams();
  const isSelf = !id || id === user?._id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [bio, setBio] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);

  const { data: stats } = useQuery({
    enabled: isSelf,
    queryKey: ["profile-stats"],
    queryFn: async () => {
      const res = await api.get("/stats");
      return res.data as {
        tasksCompleted: number;
        friendsCount: number;
        streakDays: number;
        points: number;
      };
    },
  });

  const { data: selfProfile } = useQuery({
    enabled: isSelf,
    queryKey: ["self-profile"],
    queryFn: async () => {
      const res = await api.get("/users/profile");
      return res.data as {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        bio?: string;
        interests?: string[];
        createdAt?: string;
      };
    },
  });

  const { data: otherUser } = useQuery({
    enabled: !!id && !isSelf,
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await api.get(`/users/${id}`);
      return res.data as {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        bio?: string;
        interests?: string[];
        createdAt?: string;
      };
    },
  });

  useEffect(() => {
    if (!isSelf && otherUser) {
      setName(otherUser.name);
      setEmail(otherUser.email);
      setAvatar(otherUser.avatar);
      setBio(otherUser.bio || "");
      setInterests(otherUser.interests || []);
    } else if (isSelf && (selfProfile || user)) {
      const base = selfProfile || user!;
      setName(base.name);
      setEmail(base.email);
      setAvatar(base.avatar);
      setBio((base as any).bio || "");
      setInterests((base as any).interests || []);
    }
  }, [isSelf, otherUser, user, selfProfile]);

  const statsGrid = isSelf
    ? [
        {
          label: "Tasks Completed",
          value: String(stats?.tasksCompleted ?? 0),
          icon: CheckCircle,
          color: "text-success",
        },
        {
          label: "Friends Active",
          value: String(stats?.friendsCount ?? 0),
          icon: User,
          color: "text-primary",
        },
        {
          label: "Current Streak",
          value: `${stats?.streakDays ?? 0} days`,
          icon: Flame,
          color: "text-destructive",
        },
        {
          label: "Total Points",
          value: String(stats?.points ?? 0),
          icon: TrendingUp,
          color: "text-primary-variant",
        },
      ]
    : [];

  const handleSave = async () => {
    const res = await api.put("/users/profile", {
      name,
      email,
      avatar,
      bio,
      interests,
    });
    const updated = res.data;
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully",
    });
    setUserData(updated);
    await qc.invalidateQueries({ queryKey: ["self-profile"] });
    setIsEditing(false);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="glass-card border border-border/50 animate-fade-in mb-8">
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mt-0">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-bold text-3xl text-foreground mb-1">
                      {name}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {email}
                    </p>
                  </div>

                  {!isEditing && isSelf && (
                    <Button
                      variant="hero"
                      onClick={() => setIsEditing(true)}
                      className="hover-lift"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  {!isSelf && (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/friends")}
                    >
                      Kembali
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        {isSelf && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsGrid.map((stat, index) => (
              <Card
                key={index}
                className="p-6 glass-card hover-lift animate-slide-up border border-border/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="font-heading font-bold text-2xl text-foreground">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Profile Form */}
        {isEditing ? (
          <Card className="p-6 glass-card border border-border/50 animate-scale-in">
            <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
              Edit Profile Information
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full"
                />
              </div>
              <div>
                <Label>Pilih Avatar</Label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {[
                    "ocean",
                    "blue",
                    "sunset",
                    "forest",
                    "sky",
                    "wave",
                    "coral",
                    "pearl",
                    "reef",
                    "tide",
                  ].map((seed) => {
                    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    return (
                      <button
                        key={seed}
                        className={`rounded-full overflow-hidden border ${
                          avatar === url ? "border-primary" : "border-muted"
                        }`}
                        onClick={() => setAvatar(url)}
                      >
                        <img src={url} alt={seed} className="h-14 w-14" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input
                  id="interests"
                  value={interests.join(", ")}
                  onChange={(e) =>
                    setInterests(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  className="rounded-full"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "Productivity",
                    "Organization",
                    "Technology",
                    "Networking",
                    "Health",
                    "Learning",
                    "Finance",
                    "Creativity",
                  ].map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant={interests.includes(opt) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setInterests((prev) =>
                          prev.includes(opt)
                            ? prev.filter((i) => i !== opt)
                            : [...prev, opt]
                        );
                      }}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="hero" onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            className="p-6 glass-card border border-border/50 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
              About
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="text-foreground font-medium mt-1">
                  {(() => {
                    const dateStr = (
                      isSelf ? selfProfile?.createdAt : otherUser?.createdAt
                    ) as string | undefined;
                    if (!dateStr) return "-";
                    const d = new Date(dateStr);
                    return d.toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    });
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Bio</Label>
                <p className="text-foreground mt-1">{bio || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Interests</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(interests.length ? interests : ["-"]).map((i, idx) => (
                    <Badge key={idx} variant="outline">
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
