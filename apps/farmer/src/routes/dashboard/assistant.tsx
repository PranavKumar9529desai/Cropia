import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card } from "@repo/ui/components/card";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Send, CloudSun, Sprout, Droplets } from "lucide-react";
import { Markdown } from "markdown-to-jsx";
import { MarkdownComponents } from "../../utils/markdown-renderer";
import { PageHeader } from "../../components/page-title-center";

const SUGGESTED_PROMPTS = [
  {
    title: "Recent Scans",
    prompt: "Show me my recent crop scans",
    icon: Sprout,
  },
  {
    title: "Weather Forecast",
    prompt: "What is the current weather forecast?",
    icon: CloudSun,
  },
  {
    title: "Spray Advice",
    prompt: "Is it safe to spray today?",
    icon: Droplets,
  },
];

export const Route = createFileRoute("/dashboard/assistant")({
  component: RouteComponent,
});

function RouteComponent() {
  const [input, setInput] = useState("");
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: baseURL + "/api/ai/chat",
      credentials: "include",
    }),
    onError: (err) => console.error("Chat error:", err),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage({ text: input });
    setInput("");
  };
  // TODO: add the auto scroll behaviour to the scroll area

  return (
    <div className="container h-[calc(100vh-4rem)] flex flex-col  max-w-7xl mx-auto p-2 md:p-6 min-w-3xl w-full">
      <Card className="flex-1 mb-4 overflow-hidden bg-background border-none shadow-none">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <>
                <PageHeader
                  title="Cropia Assistant"
                  subtitle="How can I help you with your crops today?"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl px-4 mx-auto">
                  {SUGGESTED_PROMPTS.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => sendMessage({ text: item.prompt })}
                      className="flex flex-col items-center p-4 space-y-2 bg-muted/50 hover:bg-muted rounded-xl transition-colors border border-border/50 text-center group cursor-pointer"
                    >
                      <div className="p-3 rounded-full bg-background group-hover:scale-110 transition-transform">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="font-medium text-sm ">{item.title}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 sm:max-w-[85%] max-w-[95%] ${m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                    }`}
                >
                  {m.parts ? (
                    m.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <Markdown
                            key={index}
                            options={{ overrides: MarkdownComponents }}
                          >
                            {part.text}
                          </Markdown>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <Markdown options={{ overrides: MarkdownComponents }}>
                      {/* @ts-expect-error */}
                      {m.content}
                    </Markdown>
                  )}
                </div>
              </div>
            ))}
            {status === "submitted" && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 max-w-[85%] space-y-2">
                  <Skeleton className="h-4 w-[200px] bg-muted" />
                  <Skeleton className="h-4 w-[150px] bg-muted" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <form
        onSubmit={handleSubmit}
        className="relative flex items-center p-2 bg-background border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your crops..."
          disabled={isLoading}
          className="flex-1 border-none shadow-none focus-visible:ring-0 h-12 text-base bg-transparent"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-10 w-10 ml-2 shrink-0 rounded-lg transition-all"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
