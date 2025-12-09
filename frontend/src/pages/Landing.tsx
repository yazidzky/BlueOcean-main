import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  Users,
  MessageCircle,
  Zap,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [installEvent, setInstallEvent] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    const onAppInstalled = () => {
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const features = [
    {
      icon: CheckCircle,
      title: "Smart Task Management",
      description:
        "Organize your life with intuitive to-do lists, filters, and progress tracking.",
    },
    {
      icon: Users,
      title: "Stay Connected",
      description: "Add friends and see their online status in real-time.",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description:
        "Chat with friends instantly with a beautiful, modern interface.",
    },
    {
      icon: Zap,
      title: "Fast & Smooth",
      description: "Enjoy smooth animations and lightning-fast performance.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/10 to-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">
              🌊
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            BlueOcean
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="hidden sm:inline-flex"
          >
            Login
          </Button>
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/register")}
            className="hidden sm:inline-flex"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="font-heading font-bold text-4xl sm:text-6xl lg:text-7xl text-foreground mb-6">
            Organize Life,
            <br />
            <span className="text-primary">Stay Connected</span>
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
            To-Do lists + real-time chat with friends — calm, productive,
            joyful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate("/register")}
              className="hover-lift w-full sm:w-auto"
            >
              Get Started Free
            </Button>
            <Button
              variant="glass"
              size="xl"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
            {installEvent && (
              <Button
                variant="glass"
                size="xl"
                className="w-full sm:w-auto"
                onClick={async () => {
                  await installEvent.prompt();
                  await installEvent.userChoice;
                  setInstallEvent(null);
                }}
              >
                Install App
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-heading font-bold text-3xl md:text-4xl text-center text-foreground mb-12">
            Everything you need to stay organized
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 glass-card hover-lift animate-slide-up border border-border/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <Card className="max-w-4xl mx-auto p-6 md:p-12 text-center glass-card border border-border/50">
          <h3 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Ready to dive in?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users organizing their lives with BlueOcean
          </p>
          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate("/register")}
            className="hover-lift w-full sm:w-auto"
          >
            Create Your Account
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-20">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 BlueOcean</p>
        </div>
      </footer>
    </div>
  );
}
