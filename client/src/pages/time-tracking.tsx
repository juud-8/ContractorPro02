import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Play, Square, Clock, Edit, Trash2, Timer, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type TimeEntryWithCustomer, type Customer, insertTimeEntrySchema } from "@shared/schema";

const timeEntryFormSchema = insertTimeEntrySchema.extend({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
});

type TimeEntryFormData = z.infer<typeof timeEntryFormSchema>;

export default function TimeTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntryWithCustomer | null>(null);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: timeEntries, isLoading } = useQuery<TimeEntryWithCustomer[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      startTime: new Date().toISOString().slice(0, 16),
      billable: true,
      hourlyRate: "75.00",
    },
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data: TimeEntryFormData) => {
      const entryData = {
        ...data,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        duration: data.endTime ? 
          Math.round((new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1000 * 60)) : 
          null,
        customerId: data.customerId || undefined,
      };
      return apiRequest(editingEntry ? "PUT" : "POST", 
        editingEntry ? `/api/time-entries/${editingEntry.id}` : "/api/time-entries", 
        entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setIsDialogOpen(false);
      setEditingEntry(null);
      form.reset();
      toast({
        title: "Success",
        description: editingEntry ? "Time entry updated successfully" : "Time entry created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save time entry",
        variant: "destructive",
      });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });
    },
  });

  const startTimerMutation = useMutation({
    mutationFn: async (data: { customerId?: number; projectDescription: string; hourlyRate: string }) => {
      const entryData = {
        ...data,
        startTime: new Date(),
        billable: true,
        customerId: data.customerId || undefined,
      };
      return apiRequest("POST", "/api/time-entries", entryData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setActiveTimer(data.id);
      toast({
        title: "Timer Started",
        description: "Time tracking has begun",
      });
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: async (id: number) => {
      const endTime = new Date();
      const entry = timeEntries?.find(e => e.id === id);
      if (!entry) throw new Error("Time entry not found");
      
      const duration = Math.round((endTime.getTime() - new Date(entry.startTime).getTime()) / (1000 * 60));
      
      return apiRequest("PUT", `/api/time-entries/${id}`, {
        endTime,
        duration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setActiveTimer(null);
      toast({
        title: "Timer Stopped",
        description: "Time entry completed",
      });
    },
  });

  const filteredEntries = timeEntries?.filter(entry =>
    entry.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
  const billableHours = filteredEntries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0) / 60;
  const totalEarnings = filteredEntries.filter(e => e.billable && e.hourlyRate).reduce((sum, e) => 
    sum + ((e.duration || 0) / 60 * parseFloat(e.hourlyRate || "0")), 0);

  const handleEdit = (entry: TimeEntryWithCustomer) => {
    setEditingEntry(entry);
    form.reset({
      ...entry,
      startTime: new Date(entry.startTime).toISOString().slice(0, 16),
      endTime: entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : undefined,
      customerId: entry.customerId || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      deleteTimeEntryMutation.mutate(id);
    }
  };

  const handleStartTimer = () => {
    const customerId = form.watch("customerId");
    const projectDescription = form.watch("projectDescription");
    const hourlyRate = form.watch("hourlyRate");
    
    if (!projectDescription) {
      toast({
        title: "Error",
        description: "Please enter a project description",
        variant: "destructive",
      });
      return;
    }

    startTimerMutation.mutate({ customerId, projectDescription, hourlyRate });
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      stopTimerMutation.mutate(activeTimer);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const onSubmit = (data: TimeEntryFormData) => {
    createTimeEntryMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <div className="flex items-center space-x-2">
          {activeTimer ? (
            <Button 
              variant="destructive"
              onClick={handleStopTimer}
              disabled={stopTimerMutation.isPending}
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Timer
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={handleStartTimer}
              disabled={startTimerMutation.isPending}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  setEditingEntry(null);
                  form.reset({
                    startTime: new Date().toISOString().slice(0, 16),
                    billable: true,
                    hourlyRate: "75.00",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Edit Time Entry" : "Add Time Entry"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <Select
                    value={form.watch("customerId")?.toString() || ""}
                    onValueChange={(value) => form.setValue("customerId", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Input
                    id="projectDescription"
                    placeholder="What are you working on?"
                    {...form.register("projectDescription")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      {...form.register("startTime")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      {...form.register("endTime")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    placeholder="75.00"
                    {...form.register("hourlyRate")}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billable"
                    checked={form.watch("billable")}
                    onCheckedChange={(checked) => form.setValue("billable", checked as boolean)}
                  />
                  <Label htmlFor="billable">Billable</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    {...form.register("notes")}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTimeEntryMutation.isPending}>
                    {createTimeEntryMutation.isPending 
                      ? (editingEntry ? "Updating..." : "Creating...") 
                      : (editingEntry ? "Update" : "Create")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{billableHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTimer ? (
                <span className="text-blue-600 flex items-center">
                  <Timer className="w-5 h-5 mr-1" />
                  Running
                </span>
              ) : (
                "—"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time Entries</CardTitle>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {searchTerm ? "No time entries found matching your search" : "No time entries recorded yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.startTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {entry.customer?.name || "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.projectDescription}
                    </TableCell>
                    <TableCell>
                      {entry.duration ? formatDuration(entry.duration) : (
                        <Badge variant="secondary">
                          <Timer className="w-3 h-3 mr-1" />
                          Running
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.hourlyRate ? `$${entry.hourlyRate}/hr` : "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.duration && entry.hourlyRate ? 
                        `$${((entry.duration / 60) * parseFloat(entry.hourlyRate)).toFixed(2)}` : 
                        "—"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.billable ? "default" : "secondary"}>
                        {entry.billable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}