import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Smile, Paperclip, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getSocket, initializeSocket } from "@/lib/socket";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
  lastMessage: string;
  unread: number;
  chatId: string;
}

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    name?: string;
    avatar?: string;
  } | string;
  createdAt: string;
  read?: boolean;
  imageUrl?: string;
}

export default function Chat() {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojis = [
    "😀","😁","😂","🤣","😊","😍","😘","😎","😉","🥳",
    "🤩","😇","🙂","🙃","😌","😅","🤗","🤝","👍","🙏",
  ];
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("blueocean-token");
    if (token) initializeSocket(token);

    const loadChats = async () => {
      const res = await api.get("/chats");
      const chats = res.data as any[];
      const mapped: Contact[] = chats.map((chat) => {
        const other = chat.participants.find((p: any) => p._id !== user?._id);
        return {
          id: other._id,
          name: other.name,
          avatar: other.avatar,
          status: other.status || "offline",
          lastMessage: chat.lastMessage || "",
          unread: 0,
          chatId: chat._id,
        };
      });
      setContacts(mapped);
      const isMobile = window.innerWidth < 768;
      if (location.state?.selectedFriend) {
        const sel = mapped.find((c) => c.id === location.state.selectedFriend._id);
        setSelectedContact(sel || null);
        setShowListOnMobile(false);
      } else {
        if (isMobile) {
          setSelectedContact(null);
          setShowListOnMobile(true);
        } else {
          setSelectedContact(mapped[0] || null);
          setShowListOnMobile(false);
        }
      }
    };
    loadChats();
  }, [location.state, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;
      const res = await api.get(`/chats/${selectedContact.chatId}/messages`);
      setMessages(res.data);
    };
    fetchMessages();
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact && window.innerWidth < 768) {
      setShowListOnMobile(false);
    }
  }, [selectedContact]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (payload: { chatId: string; message: Message }) => {
      if (selectedContact && payload.chatId === selectedContact.chatId) {
        setMessages((prev) => [...prev, payload.message]);
      }
    };
    socket.on("new_message", handler);
    return () => {
      socket.off("new_message", handler);
    };
  }, [selectedContact]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onUserStatus = (payload: { userId: string; status: "online" | "offline" | "away" }) => {
      setContacts((prev) => prev.map((c) => (c.id === payload.userId ? { ...c, status: payload.status } : c)));
      setSelectedContact((prev) => (prev && prev.id === payload.userId ? { ...prev, status: payload.status } : prev));
    };
    socket.on("user_status", onUserStatus);
    return () => {
      socket.off("user_status", onUserStatus);
    };
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const sendMessage = async () => {
    if (!selectedContact) return;
    if (!messageInput.trim() && !imageBase64) return;
    const payload: any = {};
    if (messageInput.trim()) payload.text = messageInput.trim();
    if (imageBase64) payload.imageBase64 = imageBase64;
    try {
      const res = await api.post(`/chats/${selectedContact.chatId}/messages`, payload);
      const sent: Message = res.data;
      setMessages((prev) => [...prev, sent]);
      setMessageInput("");
      setImagePreviewUrl(null);
      setImageBase64(null);
    } catch (error: any) {
      toast({
        title: "Gagal mengirim pesan",
        description: error.response?.data?.message || "Terjadi kesalahan saat mengirim",
        variant: "destructive",
      });
    }
  };

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedContact) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const addEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setEmojiOpen(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          {/* Contacts Column */}
          <div className={`md:col-span-4 lg:col-span-3 border-r border-border bg-card ${showListOnMobile ? "block" : "hidden md:block"}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-heading font-bold text-xl text-foreground mb-4">
                Messages
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-full"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-120px)]">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors border-b border-border ${
                    selectedContact?.id === contact.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(
                        contact.status
                      )}`}
                    />
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {contact.name}
                      </h3>
                      {contact.unread > 0 && (
                        <Badge
                          variant="default"
                          className="rounded-full px-2 py-0 text-xs"
                        >
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Column */}
          <div className={`md:col-span-8 lg:col-span-9 ${showListOnMobile ? "hidden md:flex" : "flex"} flex-col`}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setShowListOnMobile(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedContact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {selectedContact.name}
                    </h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedContact.status}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        (typeof message.sender === "string"
                          ? message.sender === user?._id
                          : (message.sender as any)?._id === user?._id)
                          ? "justify-end"
                          : "justify-start"
                      } animate-slide-up`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          (typeof message.sender === "string"
                            ? message.sender === user?._id
                            : (message.sender as any)?._id === user?._id)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-card text-foreground border border-border shadow-sm"
                        }`}
                      >
                        {message.imageUrl ? (
                          <img
                            src={message.imageUrl}
                            alt="uploaded"
                            className="rounded-xl max-h-64 w-auto mb-1"
                          />
                        ) : null}
                        {message.text ? (
                          <p className="text-sm">{message.text}</p>
                        ) : null}
                        <p
                          className={`text-xs mt-1 ${
                            (typeof message.sender === "string"
                              ? message.sender === user?._id
                              : (message.sender as any)?._id === user?._id)
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card">
                  {imagePreviewUrl && (
                    <div className="mb-3 p-2 border border-border rounded-xl bg-background">
                      <img src={imagePreviewUrl} className="rounded-lg max-h-64 w-auto mx-auto" />
                      <div className="flex gap-2 mt-2 justify-end">
                        <Button variant="outline" onClick={() => { setImagePreviewUrl(null); setImageBase64(null); }}>Batal</Button>
                      </div>
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={onPickFile}>
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="icon">
                          <Smile className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-5 gap-2">
                          {emojis.map((e) => (
                            <button
                              key={e}
                              type="button"
                              className="text-xl"
                              onClick={() => addEmoji(e)}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      placeholder="Write a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 rounded-full"
                    />
                     <Button
                       type="submit"
                       variant="hero"
                       size="icon"
                       disabled={!messageInput.trim() && !imageBase64}
                     >
                       <Send className="h-5 w-5" />
                     </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-background">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                    No conversation selected
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a contact to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
