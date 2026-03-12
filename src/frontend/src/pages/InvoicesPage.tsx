import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Client,
  type Invoice,
  type InvoiceLineItem,
  useAllClients,
  useAllInvoices,
  useCreateInvoice,
  useDeleteInvoice,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  Download,
  Loader2,
  Plus,
  PlusCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const FIRM_ADDRESS =
  "Shop No 28, Palika Bazar, Ghodbunder Rd, opp. to Om Sai Diesel, near Sai Baba Mandir, Kapurbawdi, Thane West, Thane, Maharashtra 400607";

const AMKY_LOGO = "/assets/uploads/IMG-20260312-WA0001-1.jpg";
const CA_INDIA_LOGO = "/assets/uploads/IMG-20260312-WA0002-2.jpg";

type LineItemDraft = {
  id: number;
  description: string;
  quantity: string;
  unitPrice: string;
};

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(val);
}

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function downloadInvoiceAsPdf(
  invoice: Invoice,
  client: Client | undefined,
  subtotal: number,
  gstAmt: number,
  grandTotal: number,
  gstPct: number,
) {
  const clientHtml = client
    ? `
    <div class="bill-to">
      <p class="section-label">BILL TO</p>
      <p class="client-name">${client.name}</p>
      ${client.email ? `<p class="client-detail">${client.email}</p>` : ""}
      ${client.phone ? `<p class="client-detail">${client.phone}</p>` : ""}
      ${client.address ? `<p class="client-detail">${client.address}</p>` : ""}
    </div>
  `
    : "";

  const lineItemsHtml = invoice.lineItems
    .map(
      (item) => `
    <tr>
      <td>${item.description}</td>
      <td class="text-right">${item.quantity.toString()}</td>
      <td class="text-right">${formatCurrency(Number(item.unitPrice) / 100)}</td>
      <td class="text-right">${formatCurrency((Number(item.quantity) * Number(item.unitPrice)) / 100)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice #${invoice.id.toString()} – AMKY & Co.</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #1a3a6b; margin-bottom: 24px; }
    .logo-left img { height: 70px; object-fit: contain; }
    .firm-info { flex: 1; padding: 0 20px; }
    .firm-info h1 { font-size: 20px; color: #1a3a6b; font-weight: bold; }
    .firm-info p { font-size: 11px; color: #555; line-height: 1.5; }
    .logo-right img { height: 70px; object-fit: contain; }
    .invoice-meta { text-align: right; }
    .invoice-meta .inv-title { font-size: 22px; font-weight: bold; color: #1a3a6b; letter-spacing: 2px; }
    .invoice-meta p { font-size: 12px; color: #666; margin-top: 4px; }
    .bill-to { margin-bottom: 20px; }
    .section-label { font-size: 10px; font-weight: bold; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
    .client-name { font-weight: bold; font-size: 14px; }
    .client-detail { font-size: 12px; color: #555; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #1a3a6b; color: white; }
    thead th { padding: 10px 12px; font-size: 12px; font-weight: 600; }
    .text-right { text-align: right; }
    tbody tr { border-bottom: 1px solid #eee; }
    tbody td { padding: 9px 12px; font-size: 12px; }
    tbody tr:nth-child(even) { background: #f9f9f9; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-inner { width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
    .totals-row.muted span:first-child { color: #888; }
    .totals-divider { border-top: 1px solid #ddd; margin: 6px 0; }
    .totals-total { font-weight: bold; font-size: 15px; color: #1a3a6b; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-left"><img src="${window.location.origin}${AMKY_LOGO}" alt="AMKY" /></div>
    <div class="firm-info">
      <h1>AMKY & Co.</h1>
      <p>Chartered Accountants</p>
      <p style="margin-top:6px; max-width: 280px;">${FIRM_ADDRESS}</p>
    </div>
    <div style="text-align:right;">
      <div class="logo-right" style="display:flex; justify-content:flex-end; margin-bottom:8px;"><img src="${window.location.origin}${CA_INDIA_LOGO}" alt="CA India" /></div>
      <div class="invoice-meta">
        <div class="inv-title">INVOICE</div>
        <p>#${invoice.id.toString()}</p>
        <p>${formatDate(invoice.createdAt)}</p>
      </div>
    </div>
  </div>
  ${clientHtml}
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>${lineItemsHtml}</tbody>
  </table>
  <div class="totals">
    <div class="totals-inner">
      <div class="totals-row muted"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="totals-row muted"><span>GST (${gstPct}%)</span><span>${formatCurrency(gstAmt)}</span></div>
      <div class="totals-divider"></div>
      <div class="totals-row totals-total"><span>Grand Total</span><span>${formatCurrency(grandTotal)}</span></div>
    </div>
  </div>
  <div class="footer">Thank you for your business &mdash; AMKY & Co., Chartered Accountants</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export default function InvoicesPage() {
  const { data: clients = [] } = useAllClients();
  const { data: invoices = [], isLoading } = useAllInvoices();
  const createInvoice = useCreateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientPopover, setClientPopover] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { id: Date.now(), description: "", quantity: "1", unitPrice: "" },
  ]);
  const [gst, setGst] = useState("18");

  const getClientName = (id: bigint) =>
    clients.find((c) => c.id === id)?.name ?? "Unknown";

  const subtotal = lineItems.reduce((sum, item) => {
    const qty = Number.parseFloat(item.quantity) || 0;
    const price = Number.parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const gstAmount = (subtotal * (Number.parseFloat(gst) || 0)) / 100;
  const grandTotal = subtotal + gstAmount;

  const addLine = () =>
    setLineItems((p) => [
      ...p,
      { id: Date.now(), description: "", quantity: "1", unitPrice: "" },
    ]);
  const removeLine = (i: number) =>
    setLineItems((p) => p.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof LineItemDraft, value: string) => {
    setLineItems((p) =>
      p.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error("Please select a client.");
      return;
    }
    const items: InvoiceLineItem[] = lineItems
      .filter((l) => l.description.trim())
      .map((l) => ({
        description: l.description,
        quantity: BigInt(Math.round(Number.parseFloat(l.quantity) || 1)),
        unitPrice: BigInt(
          Math.round((Number.parseFloat(l.unitPrice) || 0) * 100),
        ),
      }));
    if (items.length === 0) {
      toast.error("Add at least one line item.");
      return;
    }
    try {
      await createInvoice.mutateAsync({
        clientId: selectedClient.id,
        lineItems: items,
        gstPercentage: BigInt(Math.round(Number.parseFloat(gst) || 0)),
      });
      toast.success("Invoice created.");
      setCreateOpen(false);
      setSelectedClient(null);
      setLineItems([
        { id: Date.now(), description: "", quantity: "1", unitPrice: "" },
      ]);
      setGst("18");
    } catch {
      toast.error("Failed to create invoice.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteInvoice.mutateAsync(id);
      toast.success("Invoice deleted.");
    } catch {
      toast.error("Failed to delete invoice.");
    }
  };

  const ViewInvoiceModal = () => {
    if (!viewInvoice) return null;
    const client = clients.find((c) => c.id === viewInvoice.clientId);
    const subtotalInv = viewInvoice.lineItems.reduce(
      (s, item) => s + Number(item.quantity) * (Number(item.unitPrice) / 100),
      0,
    );
    const gstPct = Number(viewInvoice.gstPercentage);
    const gstAmtInv = (subtotalInv * gstPct) / 100;
    const grandTotalInv = subtotalInv + gstAmtInv;
    return (
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-2xl" data-ocid="invoices.view_dialog">
          <div id="invoice-print">
            {/* Invoice Header with both logos */}
            <div
              className="flex items-start justify-between mb-5 pb-4 border-b-2"
              style={{ borderColor: "#1a3a6b" }}
            >
              {/* Left: AMKY logo */}
              <div className="flex items-center gap-3">
                <img
                  src={AMKY_LOGO}
                  alt="AMKY & Co."
                  className="h-16 w-auto object-contain"
                />
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#1a3a6b" }}
                  >
                    AMKY & Co.
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Chartered Accountants
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
                    {FIRM_ADDRESS}
                  </p>
                </div>
              </div>
              {/* Right: CA India logo + invoice details */}
              <div className="flex flex-col items-end gap-2">
                <img
                  src={CA_INDIA_LOGO}
                  alt="CA India"
                  className="h-16 w-auto object-contain"
                />
                <div className="text-right">
                  <p
                    className="text-base font-bold tracking-widest"
                    style={{ color: "#1a3a6b" }}
                  >
                    INVOICE
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{viewInvoice.id.toString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(viewInvoice.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {client && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Bill To
                </p>
                <p className="font-semibold">{client.name}</p>
                {client.email && (
                  <p className="text-sm text-muted-foreground">
                    {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-muted-foreground">
                    {client.phone}
                  </p>
                )}
                {client.address && (
                  <p className="text-sm text-muted-foreground">
                    {client.address}
                  </p>
                )}
              </div>
            )}

            <Table className="mb-4">
              <TableHeader>
                <TableRow style={{ background: "#1a3a6b" }}>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-right text-white">Qty</TableHead>
                  <TableHead className="text-right text-white">Rate</TableHead>
                  <TableHead className="text-right text-white">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewInvoice.lineItems.map((item, i) => (
                  <TableRow key={`inv-item-${i}-${item.description}`}>
                    <TableCell className="text-sm">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.quantity.toString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(Number(item.unitPrice) / 100)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(
                        (Number(item.quantity) * Number(item.unitPrice)) / 100,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotalInv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST ({gstPct}%)</span>
                  <span>{formatCurrency(gstAmtInv)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Grand Total</span>
                  <span style={{ color: "#1a3a6b" }}>
                    {formatCurrency(grandTotalInv)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              data-ocid="invoices.close_button"
              onClick={() => setViewInvoice(null)}
            >
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
            <Button
              data-ocid="invoices.download_button"
              onClick={() =>
                downloadInvoiceAsPdf(
                  viewInvoice,
                  client,
                  subtotalInv,
                  gstAmtInv,
                  grandTotalInv,
                  gstPct,
                )
              }
              className="gap-2"
              style={{ background: "#1a3a6b", color: "white" }}
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

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
              Invoices
            </h1>
            <p className="text-muted-foreground mt-1">
              {invoices.length} total invoices
            </p>
          </div>
          <Button
            data-ocid="invoices.create_button"
            onClick={() => setCreateOpen(true)}
            className="gap-2"
            style={{
              background: "oklch(0.26 0.09 260)",
              color: "oklch(0.98 0.005 260)",
            }}
          >
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-16"
            data-ocid="invoices.loading_state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="invoices.empty_state"
                    >
                      No invoices yet. Create your first invoice.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv, i) => (
                    <TableRow
                      key={inv.id.toString()}
                      data-ocid={`invoices.row.${i + 1}`}
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {getClientName(inv.clientId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(inv.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inv.gstPercentage.toString()}%
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {formatCurrency(Number(inv.totalAmount) / 100)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setViewInvoice(inv)}
                          >
                            <Search className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            data-ocid={`invoices.delete_button.${i + 1}`}
                            onClick={() => handleDelete(inv.id)}
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
          </div>
        )}
      </motion.div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl" data-ocid="invoices.create_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Create Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Popover open={clientPopover} onOpenChange={setClientPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    data-ocid="invoices.client_select"
                  >
                    {selectedClient
                      ? selectedClient.name
                      : "Search and select client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                      <CommandEmpty>No client found.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((c) => (
                          <CommandItem
                            key={c.id.toString()}
                            value={c.name}
                            onSelect={() => {
                              setSelectedClient(c);
                              setClientPopover(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient?.id === c.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Line Items</Label>
              <div className="space-y-2">
                {lineItems.map((item, i) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center"
                  >
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateLine(i, "description", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Qty"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLine(i, "quantity", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Rate (₹)"
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLine(i, "unitPrice", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeLine(i)}
                      disabled={lineItems.length === 1}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="invoices.add_line_item_button"
                onClick={addLine}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Line
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-1.5 w-32">
                <Label htmlFor="gst-pct">GST %</Label>
                <Input
                  id="gst-pct"
                  type="number"
                  min="0"
                  max="100"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-muted/40 rounded-lg p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST ({gst || 0}%)</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>Grand Total</span>
                <span style={{ color: "oklch(0.26 0.09 260)" }}>
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="invoices.cancel_button"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="invoices.save_button"
                disabled={createInvoice.isPending}
                style={{ background: "oklch(0.26 0.09 260)", color: "white" }}
              >
                {createInvoice.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Create Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ViewInvoiceModal />
    </div>
  );
}
