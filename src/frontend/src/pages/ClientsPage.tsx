import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  type Client,
  ClientType,
  useAllClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from "@/hooks/useQueries";
import { Edit2, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  clientType: ClientType.itr,
};

function TypeBadge({ type }: { type: ClientType }) {
  const cfg = {
    [ClientType.gst]: {
      label: "GST",
      bg: "oklch(0.55 0.18 150 / 0.15)",
      color: "oklch(0.35 0.15 150)",
    },
    [ClientType.itr]: {
      label: "ITR",
      bg: "oklch(0.45 0.18 220 / 0.15)",
      color: "oklch(0.28 0.12 220)",
    },
    [ClientType.both]: {
      label: "Both",
      bg: "oklch(0.78 0.14 85 / 0.15)",
      color: "oklch(0.50 0.12 85)",
    },
  }[type];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useAllClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  const itrClients = filtered.filter(
    (c) => c.clientType === ClientType.itr || c.clientType === ClientType.both,
  );
  const gstClients = filtered.filter(
    (c) => c.clientType === ClientType.gst || c.clientType === ClientType.both,
  );

  const openAdd = () => {
    setEditClient(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      clientType: client.clientType,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editClient) {
        await updateClient.mutateAsync({ id: editClient.id, ...form });
        toast.success("Client updated successfully.");
      } else {
        await createClient.mutateAsync(form);
        toast.success("Client added successfully.");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Failed to save client. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteClient.mutateAsync(deleteId);
      toast.success("Client deleted.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Failed to delete client.");
    }
    setDeleteId(null);
  };

  const isBusy = createClient.isPending || updateClient.isPending;

  const ClientTable = ({
    list,
    startIndex,
  }: { list: Client[]; startIndex?: number }) => (
    <Table data-ocid="clients.table">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center py-8 text-muted-foreground"
              data-ocid="clients.empty_state"
            >
              No clients found.
            </TableCell>
          </TableRow>
        ) : (
          list.map((client, i) => (
            <TableRow
              key={client.id.toString()}
              data-ocid={`clients.row.${(startIndex ?? 0) + i + 1}`}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{client.name}</p>
                  {client.address && (
                    <p className="text-xs text-muted-foreground truncate max-w-40">
                      {client.address}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">{client.email}</TableCell>
              <TableCell className="text-sm">{client.phone}</TableCell>
              <TableCell>
                <TypeBadge type={client.clientType} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    data-ocid={`clients.edit_button.${(startIndex ?? 0) + i + 1}`}
                    onClick={() => openEdit(client)}
                    className="h-7 w-7"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    data-ocid={`clients.delete_button.${(startIndex ?? 0) + i + 1}`}
                    onClick={() => setDeleteId(client.id)}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Clients
            </h1>
            <p className="text-muted-foreground mt-1">
              {clients.length} total clients
            </p>
          </div>
          <Button
            data-ocid="clients.add_button"
            onClick={openAdd}
            className="gap-2"
            style={{
              background: "oklch(0.26 0.09 260)",
              color: "oklch(0.98 0.005 260)",
            }}
          >
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="clients.search_input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-16"
            data-ocid="clients.loading_state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="itr">
            <TabsList className="mb-4">
              <TabsTrigger value="itr" data-ocid="clients.itr_tab">
                ITR Clients ({itrClients.length})
              </TabsTrigger>
              <TabsTrigger value="gst" data-ocid="clients.gst_tab">
                GST Clients ({gstClients.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="itr" className="mt-0">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <ClientTable list={itrClients} startIndex={0} />
              </div>
            </TabsContent>
            <TabsContent value="gst" className="mt-0">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <ClientTable list={gstClients} startIndex={0} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="clients.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name *</Label>
                <Input
                  data-ocid="clients.name_input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  data-ocid="clients.email_input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  data-ocid="clients.phone_input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Address</Label>
                <Input
                  data-ocid="clients.address_input"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Notes</Label>
                <Textarea
                  data-ocid="clients.notes_textarea"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Client Type *</Label>
                <RadioGroup
                  value={form.clientType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, clientType: v as ClientType }))
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={ClientType.itr} id="type-itr" />
                    <Label
                      htmlFor="type-itr"
                      className="cursor-pointer font-normal"
                    >
                      ITR
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={ClientType.gst} id="type-gst" />
                    <Label
                      htmlFor="type-gst"
                      className="cursor-pointer font-normal"
                    >
                      GST
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={ClientType.both} id="type-both" />
                    <Label
                      htmlFor="type-both"
                      className="cursor-pointer font-normal"
                    >
                      Both
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="clients.cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="clients.save_button"
                disabled={isBusy}
                style={{
                  background: "oklch(0.26 0.09 260)",
                  color: "oklch(0.98 0.005 260)",
                }}
              >
                {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editClient ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="clients.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The client and all associated data
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="clients.delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="clients.delete_confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteClient.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
