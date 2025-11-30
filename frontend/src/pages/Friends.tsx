import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  MessageCircle,
  UserMinus,
  Mail,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface Friend {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  status: "online" | "offline" | "away";
}

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export default function Friends() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/friends");
      setFriends(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch friends",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onUserStatus = (payload: { userId: string; status: "online" | "offline" | "away" }) => {
      setFriends((prev) => prev.map((f) => (f._id === payload.userId ? { ...f, status: payload.status } : f)));
    };
    socket.on("user_status", onUserStatus);
    return () => {
      socket.off("user_status", onUserStatus);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/friends/requests");
      setRequests(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success";
      case "away":
        return "bg-primary";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      default:
        return "Offline";
    }
  };

  const addFriend = async () => {
    if (!newFriendEmail.trim() || !newFriendEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/friends/request", { email: newFriendEmail });
      setNewFriendEmail("");
      setIsDialogOpen(false);
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (id: string) => {
    try {
      await api.delete(`/friends/${id}`);
      setFriends(friends.filter((friend) => friend._id !== id));
      toast({
        title: "Friend removed",
        description: "Friend has been removed from your list",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove friend",
        variant: "destructive",
      });
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      await api.put(`/friends/accept/${requestId}`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      fetchFriends();
      toast({ title: "Permintaan diterima" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menerima permintaan",
        variant: "destructive",
      });
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await api.put(`/friends/reject/${requestId}`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast({ title: "Permintaan ditolak" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menolak permintaan",
        variant: "destructive",
      });
    }
  };

  const startChat = async (friend: Friend) => {
    try {
      const response = await api.post("/chats", { userId: friend._id });
      navigate("/chat", {
        state: { chatId: response.data._id, selectedFriend: friend },
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
              Friends
            </h1>
            <p className="text-muted-foreground">
              Connect with friends and start conversations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="hover-lift"
              onClick={() => {
                setIsRequestsOpen(true);
                fetchRequests();
              }}
            >
              List Permintaan
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg" className="hover-lift">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Friend
                </Button>
              </DialogTrigger>
            <DialogContent className="glass-card border-border/50">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">
                  Add New Friend
                </DialogTitle>
                <DialogDescription>
                  Enter your friend's email address to send a friend request
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    className="rounded-full"
                  />
                </div>
                <Button onClick={addFriend} className="w-full" variant="hero">
                  Send Request
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="p-4 mb-6 glass-card border border-border/50 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
        </Card>

        <Card className="glass-card border border-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No friends found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search" : "Add friends to get started"}
                </p>
                {!searchQuery && (
                  <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Friend
                  </Button>
                )}
              </div>
            ) : (
              filteredFriends.map((friend, index) => (
                <div key={friend._id} className="p-4 hover:bg-accent/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(friend.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/users/${friend._id}`)}>
                      <h3 className="font-semibold text-foreground mb-1">{friend.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{friend.email}</span>
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">{getStatusText(friend.status)}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" onClick={() => startChat(friend)} className="hover-lift">
                        <MessageCircle className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Chat</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeFriend(friend._id)} className="text-destructive hover:text-destructive">
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Dialog open={isRequestsOpen} onOpenChange={setIsRequestsOpen}>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">List Permintaan</DialogTitle>
              <DialogDescription>Kelola permintaan pertemanan</DialogDescription>
            </DialogHeader>
            <div className="divide-y divide-border">
              {requests.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Tidak ada permintaan</h3>
                </div>
              ) : (
                requests.map((req, index) => (
                  <div key={req._id} className="p-4 hover:bg-accent/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={req.from.avatar} alt={req.from.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">{req.from.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 cursor-pointer" onClick={() => navigate(`/users/${req.from._id}`)}>
                          {req.from.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{req.from.email}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="default" size="sm" onClick={() => acceptRequest(req._id)} className="hover-lift">Terima</Button>
                        <Button variant="ghost" size="sm" onClick={() => rejectRequest(req._id)} className="text-destructive hover:text-destructive">Tolak</Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
