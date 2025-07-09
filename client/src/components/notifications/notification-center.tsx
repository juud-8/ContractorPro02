import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";

export default function NotificationCenter() {
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/notifications/${id}/read`, {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/notifications/read-all", {
        method: "PUT",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/notifications/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (selectedType === "all") return true;
    return notification.type === selectedType;
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const notificationTypes = [
    { value: "all", label: "All", count: notifications.length },
    { value: "invoice", label: "Invoices", count: notifications.filter((n: Notification) => n.type === "invoice").length },
    { value: "quote", label: "Quotes", count: notifications.filter((n: Notification) => n.type === "quote").length },
    { value: "payment", label: "Payments", count: notifications.filter((n: Notification) => n.type === "payment").length },
    { value: "task", label: "Tasks", count: notifications.filter((n: Notification) => n.type === "task").length },
    { value: "system", label: "System", count: notifications.filter((n: Notification) => n.type === "system").length },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return "📄";
      case "quote":
        return "📝";
      case "payment":
        return "💰";
      case "task":
        return "✅";
      case "system":
        return "⚙️";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "invoice":
        return "bg-blue-100 text-blue-800";
      case "quote":
        return "bg-purple-100 text-purple-800";
      case "payment":
        return "bg-green-100 text-green-800";
      case "task":
        return "bg-orange-100 text-orange-800";
      case "system":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadCount === 0}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {notificationTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.value)}
              className="flex items-center gap-2"
            >
              {type.label}
              {type.count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {type.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {selectedType === "all" ? "You're all caught up!" : `No ${selectedType} notifications yet.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification: Notification) => (
            <Card
              key={notification.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                !notification.isRead && "bg-blue-50 border-blue-200"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm", getNotificationColor(notification.type))}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{notification.title}</h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          <span>•</span>
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          disabled={deleteNotificationMutation.isPending}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}