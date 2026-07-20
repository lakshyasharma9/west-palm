import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, deleteCustomer } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2, Users, Mail, Building2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/customers/")({
  component: CustomersPage,
});

function CustomersPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const result = await getCustomers();
      if (!result.success) throw new Error(result.error);
      return result.customers;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeletingId(null);
    },
  });

  const handleDelete = async (id: string, username: string) => {
    if (confirm(`Are you sure you want to delete customer "${username}"?`)) {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer accounts and project assignments
          </p>
        </div>
        <Link to="/admin/customers/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Customer
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((customer: any) => (
            <div
              key={customer.customerId}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {customer.username}
                    </h3>
                    {customer.companyName && (
                      <p className="text-xs text-muted-foreground">
                        {customer.companyName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{customer.email}</span>
                </div>
                
                {customer.projectIds && customer.projectIds.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{customer.projectIds.length} project(s) assigned</span>
                  </div>
                )}
              </div>

              {customer.oneDriveLink && (
                <div className="mb-4 rounded-md bg-muted/50 p-2 text-xs">
                  <div className="font-medium text-foreground">OneDrive:</div>
                  <div className="truncate text-muted-foreground">{customer.oneDriveLink}</div>
                </div>
              )}

              <div className="flex gap-2">
                <Link to={`/admin/customers/${customer.customerId}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(customer.customerId, customer.username)}
                  disabled={deletingId === customer.customerId}
                  className="gap-2"
                >
                  {deletingId === customer.customerId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {customer.lastLogin && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Last login: {new Date(customer.lastLogin).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No customers yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first customer account to get started
          </p>
          <Link to="/admin/customers/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Customer
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
