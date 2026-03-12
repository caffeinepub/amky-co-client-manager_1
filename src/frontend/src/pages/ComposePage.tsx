import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  type Client,
  ClientType,
  useAllClients,
  useSenderConfig,
  useUpdateSenderConfig,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  FileUp,
  Loader2,
  Mail,
  MessageCircle,
  Paperclip,
  Save,
  Send,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type FilterType = "all" | "itr" | "gst";

const ACCEPTED_FILE_TYPES =
  ".pdf,.png,.xlsx,.xls,.doc,.docx,.zip,application/pdf,image/png,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip";

function FileAttachmentRow({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const iconColor: Record<string, string> = {
    pdf: "#e74c3c",
    png: "#3498db",
    xlsx: "#27ae60",
    xls: "#27ae60",
    doc: "#2980b9",
    docx: "#2980b9",
    zip: "#f39c12",
  };
  return (
    <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 text-sm border border-border">
      <Paperclip
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: iconColor[ext] ?? "#888" }}
      />
      <span className="truncate flex-1 max-w-xs">{file.name}</span>
      <span className="text-xs text-muted-foreground shrink-0">
        {(file.size / 1024).toFixed(0)} KB
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ComposePage() {
  const { data: clients = [] } = useAllClients();
  const { data: senderConfig } = useSenderConfig();
  const updateSender = useUpdateSenderConfig();

  const [bulkFilter, setBulkFilter] = useState<FilterType>("all");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [indivMessage, setIndivMessage] = useState("");
  const [indivFiles, setIndivFiles] = useState<File[]>([]);
  const indivFileRef = useRef<HTMLInputElement>(null);

  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  useEffect(() => {
    if (senderConfig) {
      setSenderEmail(senderConfig.email);
      setSenderPhone(senderConfig.phone);
    }
  }, [senderConfig]);

  const getFilteredClients = () => {
    if (bulkFilter === "itr")
      return clients.filter(
        (c) =>
          c.clientType === ClientType.itr || c.clientType === ClientType.both,
      );
    if (bulkFilter === "gst")
      return clients.filter(
        (c) =>
          c.clientType === ClientType.gst || c.clientType === ClientType.both,
      );
    return clients;
  };

  const addFiles = (
    incoming: FileList | null,
    existing: File[],
    setter: (f: File[]) => void,
  ) => {
    if (!incoming) return;
    const newFiles = Array.from(incoming).filter(
      (f) => !existing.some((e) => e.name === f.name && e.size === f.size),
    );
    setter([...existing, ...newFiles]);
  };

  const handleBulkWhatsApp = () => {
    const list = getFilteredClients();
    if (!bulkMessage.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    if (list.length === 0) {
      toast.error("No clients found.");
      return;
    }
    let msg = bulkMessage;
    if (bulkFiles.length > 0) {
      msg += `\n\n[Attachments: ${bulkFiles.map((f) => f.name).join(", ")}]\nPlease note: attach files manually in WhatsApp.`;
    }
    const encodedMsg = encodeURIComponent(msg);
    for (const c of list) {
      if (c.phone)
        window.open(
          `https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodedMsg}`,
          "_blank",
        );
    }
    toast.success(
      `Opened WhatsApp for ${list.filter((c) => c.phone).length} clients.`,
    );
  };

  const handleBulkEmail = () => {
    const list = getFilteredClients();
    if (!bulkMessage.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    const emails = list
      .filter((c) => c.email)
      .map((c) => c.email)
      .join(",");
    if (!emails) {
      toast.error("No email addresses found.");
      return;
    }
    let body = bulkMessage;
    if (bulkFiles.length > 0) {
      body += `\n\n[Files to attach: ${bulkFiles.map((f) => f.name).join(", ")}]\nPlease attach these files manually in your email client.`;
    }
    window.location.href = `mailto:?bcc=${emails}&body=${encodeURIComponent(body)}`;
  };

  const handleIndivWhatsApp = () => {
    if (!selectedClient) {
      toast.error("Please select a client.");
      return;
    }
    if (!indivMessage.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    if (!selectedClient.phone) {
      toast.error("This client has no phone number.");
      return;
    }
    let msg = indivMessage;
    if (indivFiles.length > 0) {
      msg += `\n\n[Attachments: ${indivFiles.map((f) => f.name).join(", ")}]\nPlease note: attach files manually in WhatsApp.`;
    }
    const phone = selectedClient.phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleIndivEmail = () => {
    if (!selectedClient) {
      toast.error("Please select a client.");
      return;
    }
    if (!indivMessage.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    if (!selectedClient.email) {
      toast.error("This client has no email address.");
      return;
    }
    let body = indivMessage;
    if (indivFiles.length > 0) {
      body += `\n\n[Files to attach: ${indivFiles.map((f) => f.name).join(", ")}]\nPlease attach these files manually in your email client.`;
    }
    window.location.href = `mailto:${selectedClient.email}?body=${encodeURIComponent(body)}`;
  };

  const handleSaveSender = async () => {
    try {
      await updateSender.mutateAsync({
        email: senderEmail,
        phone: senderPhone,
      });
      toast.success("Sender details saved.");
    } catch {
      toast.error("Failed to save sender details.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Compose
          </h1>
          <p className="text-muted-foreground mt-1">
            Send messages to your clients
          </p>
        </div>

        <Tabs defaultValue="message-all">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger
              value="message-all"
              data-ocid="compose.message_all_tab"
              className="gap-2"
            >
              <Users className="h-3.5 w-3.5" /> Message All
            </TabsTrigger>
            <TabsTrigger
              value="individual"
              data-ocid="compose.individual_tab"
              className="gap-2"
            >
              <Send className="h-3.5 w-3.5" /> Individual
            </TabsTrigger>
            <TabsTrigger
              value="sender-details"
              data-ocid="compose.sender_details_tab"
              className="gap-2"
            >
              <Mail className="h-3.5 w-3.5" /> Sender Details
            </TabsTrigger>
          </TabsList>

          {/* Message All tab */}
          <TabsContent value="message-all" className="mt-0">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
              <div className="space-y-2">
                <Label>Send To</Label>
                <RadioGroup
                  value={bulkFilter}
                  onValueChange={(v) => setBulkFilter(v as FilterType)}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="all" id="bulk-all" />
                    <Label
                      htmlFor="bulk-all"
                      className="font-normal cursor-pointer"
                    >
                      All Clients ({clients.length})
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="itr" id="bulk-itr" />
                    <Label
                      htmlFor="bulk-itr"
                      className="font-normal cursor-pointer"
                    >
                      ITR Clients (
                      {
                        clients.filter(
                          (c) =>
                            c.clientType === ClientType.itr ||
                            c.clientType === ClientType.both,
                        ).length
                      }
                      )
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="gst" id="bulk-gst" />
                    <Label
                      htmlFor="bulk-gst"
                      className="font-normal cursor-pointer"
                    >
                      GST Clients (
                      {
                        clients.filter(
                          (c) =>
                            c.clientType === ClientType.gst ||
                            c.clientType === ClientType.both,
                        ).length
                      }
                      )
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-msg">Message</Label>
                <Textarea
                  id="bulk-msg"
                  data-ocid="compose.message_textarea"
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={5}
                  placeholder="Type your message here..."
                />
              </div>

              {/* File attachment */}
              <div className="space-y-2">
                <Label>Attach Files</Label>
                <input
                  ref={bulkFileRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    addFiles(e.target.files, bulkFiles, setBulkFiles)
                  }
                  data-ocid="compose.upload_button"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => bulkFileRef.current?.click()}
                >
                  <FileUp className="h-3.5 w-3.5" /> Attach Files
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supported: PDF, PNG, Excel (.xlsx), Word (.docx), ZIP
                </p>
                {bulkFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {bulkFiles.map((f, i) => (
                      <FileAttachmentRow
                        key={`bulk-${f.name}-${i}`}
                        file={f}
                        onRemove={() =>
                          setBulkFiles((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  data-ocid="compose.whatsapp_button"
                  onClick={handleBulkWhatsApp}
                  className="gap-2"
                  style={{ background: "oklch(0.45 0.18 150)", color: "white" }}
                >
                  <MessageCircle className="h-4 w-4" /> Send via WhatsApp
                </Button>
                <Button
                  data-ocid="compose.email_button"
                  onClick={handleBulkEmail}
                  variant="outline"
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" /> Send via Email (BCC)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                WhatsApp: Opens individual chat windows. Email: Opens your email
                client with all recipients in BCC. File attachments must be
                added manually in WhatsApp or your email client.
              </p>
            </div>
          </TabsContent>

          {/* Individual tab */}
          <TabsContent value="individual" className="mt-0">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Popover
                  open={clientPopoverOpen}
                  onOpenChange={setClientPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {selectedClient
                        ? selectedClient.name
                        : "Search and select client..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search client..." />
                      <CommandList>
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {clients.map((client) => (
                            <CommandItem
                              key={client.id.toString()}
                              value={client.name}
                              onSelect={() => {
                                setSelectedClient(client);
                                setClientPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClient?.id === client.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div>
                                <p className="text-sm font-medium">
                                  {client.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {client.email} · {client.phone}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedClient && (
                <div className="rounded-lg border border-border p-3 bg-muted/30 text-sm">
                  <p className="font-medium">{selectedClient.name}</p>
                  {selectedClient.email && (
                    <p className="text-muted-foreground">
                      ✉ {selectedClient.email}
                    </p>
                  )}
                  {selectedClient.phone && (
                    <p className="text-muted-foreground">
                      📱 {selectedClient.phone}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="indiv-msg">Message</Label>
                <Textarea
                  id="indiv-msg"
                  value={indivMessage}
                  onChange={(e) => setIndivMessage(e.target.value)}
                  rows={5}
                  placeholder="Type your message..."
                />
              </div>

              {/* File attachment */}
              <div className="space-y-2">
                <Label>Attach Files</Label>
                <input
                  ref={indivFileRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    addFiles(e.target.files, indivFiles, setIndivFiles)
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => indivFileRef.current?.click()}
                >
                  <FileUp className="h-3.5 w-3.5" /> Attach Files
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supported: PDF, PNG, Excel (.xlsx), Word (.docx), ZIP
                </p>
                {indivFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {indivFiles.map((f, i) => (
                      <FileAttachmentRow
                        key={`indiv-${f.name}-${i}`}
                        file={f}
                        onRemove={() =>
                          setIndivFiles((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleIndivWhatsApp}
                  className="gap-2"
                  style={{ background: "oklch(0.45 0.18 150)", color: "white" }}
                >
                  <MessageCircle className="h-4 w-4" /> Send WhatsApp
                </Button>
                <Button
                  onClick={handleIndivEmail}
                  variant="outline"
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" /> Send Email
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                File attachments must be added manually in WhatsApp or your
                email client.
              </p>
            </div>
          </TabsContent>

          {/* Sender Details tab */}
          <TabsContent value="sender-details" className="mt-0">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
              <p className="text-sm text-muted-foreground">
                These details appear as sender information in your messages.
              </p>
              <div className="space-y-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input
                  id="sender-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-phone">Sender WhatsApp Number</Label>
                <Input
                  id="sender-phone"
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
              <Button
                data-ocid="compose.sender_save_button"
                onClick={handleSaveSender}
                disabled={updateSender.isPending}
                style={{
                  background: "oklch(0.26 0.09 260)",
                  color: "oklch(0.98 0.005 260)",
                }}
                className="gap-2"
              >
                {updateSender.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Sender Details
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
