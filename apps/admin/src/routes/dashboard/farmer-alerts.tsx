import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { toast } from "sonner";
import { apiClient } from "@/lib/rpc";
import { Badge } from "@repo/ui/components/badge";
import { Bell, Smartphone, Send, Image as ImageIcon, Users, User } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { PhonePreview } from "@/components/dashboard/phone-preview";

export const Route = createFileRoute("/dashboard/farmer-alerts")({
  component: NotificationsPage,
});

const notificationSchema = z.object({
  targetType: z.enum(["topic", "userId"]),
  targetValue: z.string().min(1, "Target is required"),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message body is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      targetType: "topic",
      targetValue: "all",
      title: "",
      body: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (values: NotificationFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        title: values.title,
        body: values.body,
        imageUrl: values.imageUrl || undefined,
      };

      if (values.targetType === "topic") {
        payload.topic = values.targetValue;
      } else {
        payload.userId = values.targetValue;
      }

      const response = await apiClient.api.admin.notifications.send.$post({
        json: payload,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Notification sent successfully");
        form.reset({
          targetType: "topic",
          targetValue: "all",
          title: "",
          body: "",
          imageUrl: "",
        });
      } else {
        toast.error(result.error || "Failed to send notification");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 md:px-0 px-2">
      <div className="mb-10 flex items-center justify-between border-b border-border/40 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground/90">
              Farmer Alerts
            </h1>
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
          <p className="text-[13px] font-medium text-muted-foreground/70 uppercase tracking-wider">
            Broadcast-wide updates & targeted device notifications
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right mr-2 hidden lg:block">
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-tighter">Status</p>
            <p className="text-xs font-bold text-emerald-600/80">Active & Ready</p>
          </div>
          {/* <Badge variant="outline" className="px-3 py-1 text-[10px] font-bold border-emerald-100 bg-emerald-50/50 text-emerald-700 uppercase tracking-tight">
            Node: IN-WEST-1
          </Badge> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card sm:bg-transparent rounded-xl border sm:border-0 shadow-sm p-6 lg:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Target Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-lg">Target Audience</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="targetType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Broadcasting Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select target type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="topic">
                                <span className="flex items-center gap-2">
                                  <Users className="w-4 h-4" /> Topic Broadcast
                                </span>
                              </SelectItem>
                              <SelectItem value="userId">
                                <span className="flex items-center gap-2">
                                  <User className="w-4 h-4" /> Specific User
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch("targetType") === "topic" ? "Topic Name" : "User ID"}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder={form.watch("targetType") === "topic" ? "e.g. all, weather-updates" : "Enter User ID"}
                                {...field}
                                className="h-11 pl-4"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            {form.watch("targetType") === "topic"
                              ? "Use 'all' to send to everyone."
                              : "Target a specific device or user account."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Bell className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-lg">Notification Content</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Heavy Rain Alert" className="h-11 font-medium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type your alert message here..."
                            className="min-h-[120px] resize-none text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="https://..." className="pl-10 h-11" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/80 transition-all shadow-lg hover:shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Broadcasting..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-5 h-5" /> Send Alert
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-5 relative mt-4 lg:mt-0">
          <div className="sticky top-8">
            <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Live Preview</h3>
            </div>

            <PhonePreview control={form.control} />

            <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-300">
              <p className="flex gap-2">
                <span className="text-xl">💡</span>
                <span>
                  <strong>Tip:</strong> Keep titles under 40 characters for best visibility on lock screens.
                  Images should be aspect ratio ~2:1.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
