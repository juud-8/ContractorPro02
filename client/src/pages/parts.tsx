import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Package, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { Part } from "@shared/schema";

const partSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  unitPrice: z.string().min(1, "Unit price is required"),
  category: z.string().optional(),
  unit: z.string().default("each"),
  inStock: z.number().int().min(0).default(0),
  minimumStock: z.number().int().min(0).default(0),
  taxable: z.boolean().default(true),
});

type PartFormData = z.infer<typeof partSchema>;

export default function Parts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const { toast } = useToast();

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["/api/parts"],
  });

  const form = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      unitPrice: "",
      category: "",
      unit: "each",
      inStock: 0,
      minimumStock: 0,
      taxable: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PartFormData) => apiRequest("/api/parts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      toast({
        title: "Success",
        description: "Part created successfully",
      });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create part",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartFormData }) =>
      apiRequest(`/api/parts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      toast({
        title: "Success",
        description: "Part updated successfully",
      });
      setEditingPart(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update part",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/parts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      toast({
        title: "Success",
        description: "Part deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete part",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PartFormData) => {
    if (editingPart) {
      updateMutation.mutate({ id: editingPart.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    form.reset({
      name: part.name,
      description: part.description || "",
      sku: part.sku || "",
      unitPrice: part.unitPrice,
      category: part.category || "",
      unit: part.unit || "each",
      inStock: part.inStock || 0,
      minimumStock: part.minimumStock || 0,
      taxable: part.taxable ?? true,
    });
  };

  const filteredParts = parts.filter((part: Part) =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (part.sku && part.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (part.description && part.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = [...new Set(parts.map((p: Part) => p.category).filter(Boolean))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold contractor-text-slate-900">Parts & Items</h1>
          <p className="text-contractor-slate-600 mt-1">Manage your frequently used parts and materials</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="contractor-gradient text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Part</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="each">Each</SelectItem>
                            <SelectItem value="box">Box</SelectItem>
                            <SelectItem value="case">Case</SelectItem>
                            <SelectItem value="hour">Hour</SelectItem>
                            <SelectItem value="pound">Pound</SelectItem>
                            <SelectItem value="gallon">Gallon</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>In Stock</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minimumStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Taxable</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingPart(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="contractor-gradient text-white"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Part"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-contractor-slate-400 h-4 w-4" />
              <Input
                placeholder="Search parts by name, SKU, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {categories.length > 0 && (
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-contractor-slate-600">
              Loading parts...
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-contractor-slate-400 mb-3" />
              <p className="text-contractor-slate-600">
                {searchQuery ? "No parts found matching your search" : "No parts added yet"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-contractor-slate-500 mt-1">
                  Add your frequently used parts to quickly add them to invoices and quotes
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Taxable</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part: Part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">
                      {part.name}
                      {part.description && (
                        <p className="text-sm text-contractor-slate-600">{part.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{part.sku || "-"}</TableCell>
                    <TableCell>${parseFloat(part.unitPrice).toFixed(2)} / {part.unit}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {part.inStock || 0}
                        {part.inStock !== null && part.minimumStock !== null && part.inStock <= part.minimumStock && (
                          <Badge variant="destructive" className="text-xs">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{part.category || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={part.taxable ? "default" : "secondary"}>
                        {part.taxable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(part)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Part</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <FormField
                                  control={form.control}
                                  name="description"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea {...field} rows={3} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="unitPrice"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Unit Price</FormLabel>
                                        <FormControl>
                                          <Input {...field} type="number" step="0.01" />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="each">Each</SelectItem>
                                            <SelectItem value="box">Box</SelectItem>
                                            <SelectItem value="case">Case</SelectItem>
                                            <SelectItem value="hour">Hour</SelectItem>
                                            <SelectItem value="pound">Pound</SelectItem>
                                            <SelectItem value="gallon">Gallon</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="inStock"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>In Stock</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field} 
                                            type="number" 
                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="minimumStock"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Minimum Stock</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field} 
                                            type="number" 
                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="taxable"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center justify-between">
                                        <FormLabel>Taxable</FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingPart(null);
                                      form.reset();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="contractor-gradient text-white"
                                    disabled={updateMutation.isPending}
                                  >
                                    {updateMutation.isPending ? "Saving..." : "Update Part"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this part?")) {
                              deleteMutation.mutate(part.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}