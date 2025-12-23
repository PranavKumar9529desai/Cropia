import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { toast } from "sonner";
import { apiClient } from "@/lib/rpc";

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
      targetValue: "all", // Default to 'all' topic if we decide to use it
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

      // const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/notifications/send`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(payload),
      // });
      const response = await apiClient.api.admin.notifications.send.$post({
        json: payload,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Notification sent successfully");
        form.reset();
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
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Send Notifications</CardTitle>
          <CardDescription>Send push notifications to farmers apps.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="topic">Topic (Broadcast)</SelectItem>
                          <SelectItem value="userId">Specific User ID</SelectItem>
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
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input placeholder={form.watch("targetType") === "topic" ? "e.g. all, news" : "User ID"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Notification Title" {...field} />
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
                      <Textarea placeholder="Type your message here..." {...field} />
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
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Notification"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
