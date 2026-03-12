import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  type Client,
  CommunicationChannel,
  useAddClientReply,
  useAllClients,
  useAllReplies,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RepliesPage() {
  const { data: clients = [] } = useAllClients();
  const clientIds = clients.map((c) => c.id);
  const { data: allRepliesData = [], isLoading } = useAllReplies(clientIds);
  const addReply = useAddClientReply();

  const [logOpen, setLogOpen] = useState(false);
  const [logClient, setLogClient] = useState<Client | null>(null);
  const [logClientPopover, setLogClientPopover] = useState(false);
  const [logChannel, setLogChannel] = useState<CommunicationChannel>(
    CommunicationChannel.whatsapp,
  );
  const [logMessage, setLogMessage] = useState("");

  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");

  const allReplies = allRepliesData
    .flatMap(({ clientId, replies }) =>
      replies.map((r) => ({
        ...r,
        clientName: clients.find((c) => c.id === clientId)?.name ?? "Unknown",
      })),
    )
    .sort((a, b) => Number(b.timestamp - a.timestamp));

  const filtered = allReplies.filter((r) => {
    const clientMatch =
      filterClient === "all" || r.clientId.toString() === filterClient;
    const channelMatch = filterChannel === "all" || r.channel === filterChannel;
    return clientMatch && channelMatch;
  });

  const handleLogReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logClient) {
      toast.error("Please select a client.");
      return;
    }
    if (!logMessage.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    try {
      await addReply.mutateAsync({
        clientId: logClient.id,
        channel: logChannel,
        message: logMessage,
      });
      toast.success("Reply logged.");
      setLogOpen(false);
      setLogClient(null);
      setLogMessage("");
      setLogChannel(CommunicationChannel.whatsapp);
    } catch {
      toast.error("Failed to log reply.");
    }
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
              Replies
            </h1>
            <p className="text-muted-foreground mt-1">
              Client replies and communications
            </p>
          </div>
          <Button
            data-ocid="replies.log_button"
            onClick={() => setLogOpen(true)}
            className="gap-2"
            style={{
              background: "oklch(0.26 0.09 260)",
              color: "oklch(0.98 0.005 260)",
            }}
          >
            <Plus className="h-4 w-4" /> Log Reply
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger
              className="w-48"
              data-ocid="replies.client_filter_select"
            >
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id.toString()} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger
              className="w-40"
              data-ocid="replies.channel_filter_select"
            >
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value={CommunicationChannel.email}>Email</SelectItem>
              <SelectItem value={CommunicationChannel.whatsapp}>
                WhatsApp
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-16"
            data-ocid="replies.loading_state"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="replies.empty_state"
                    >
                      No replies yet. Log a client reply to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((reply, i) => (
                    <TableRow
                      key={reply.id.toString()}
                      data-ocid={`replies.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {reply.clientName}
                      </TableCell>
                      <TableCell>
                        {reply.channel === CommunicationChannel.whatsapp ? (
                          <Badge
                            className="gap-1"
                            style={{
                              background: "oklch(0.45 0.18 150 / 0.15)",
                              color: "oklch(0.35 0.15 150)",
                              border: "none",
                            }}
                          >
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </Badge>
                        ) : (
                          <Badge
                            className="gap-1"
                            style={{
                              background: "oklch(0.45 0.18 220 / 0.15)",
                              color: "oklch(0.28 0.12 220)",
                              border: "none",
                            }}
                          >
                            <Mail className="h-3 w-3" /> Email
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        <p className="truncate">{reply.message}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(reply.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent data-ocid="replies.log_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Log Client Reply</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogReply} className="space-y-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Popover
                open={logClientPopover}
                onOpenChange={setLogClientPopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    data-ocid="replies.client_select"
                  >
                    {logClient ? logClient.name : "Select client..."}
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
                              setLogClient(c);
                              setLogClientPopover(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                logClient?.id === c.id
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
              <Label>Channel *</Label>
              <Select
                value={logChannel}
                onValueChange={(v) => setLogChannel(v as CommunicationChannel)}
              >
                <SelectTrigger data-ocid="replies.channel_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CommunicationChannel.whatsapp}>
                    WhatsApp
                  </SelectItem>
                  <SelectItem value={CommunicationChannel.email}>
                    Email
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                data-ocid="replies.message_textarea"
                value={logMessage}
                onChange={(e) => setLogMessage(e.target.value)}
                rows={4}
                placeholder="Enter the client's reply..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="replies.cancel_button"
                onClick={() => setLogOpen(false)}
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="replies.save_button"
                disabled={addReply.isPending}
                style={{ background: "oklch(0.26 0.09 260)", color: "white" }}
              >
                {addReply.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Reply
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
