import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActor } from "../actorSingleton";
import type {
  Client,
  ClientReply,
  Invoice,
  InvoiceLineItem,
  SenderConfig,
} from "../backend.d";
import { ClientType, CommunicationChannel } from "../backend.d";
import { useActor } from "./useActor";

export { ClientType, CommunicationChannel };
export type { Client, Invoice, ClientReply, SenderConfig, InvoiceLineItem };

export function useAllClients() {
  const { actor } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const a = actor ?? (await getActor());
      return a.getAllClients();
    },
    enabled: true,
  });
}

export function useAllInvoices() {
  const { actor } = useActor();
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const a = actor ?? (await getActor());
      return a.getAllInvoices();
    },
    enabled: true,
  });
}

export function useRepliesForClient(clientId: bigint | null) {
  const { actor } = useActor();
  return useQuery<ClientReply[]>({
    queryKey: ["replies", clientId?.toString()],
    queryFn: async () => {
      if (clientId === null) return [];
      const a = actor ?? (await getActor());
      return a.getRepliesForClient(clientId);
    },
    enabled: clientId !== null,
  });
}

export function useAllReplies(clientIds: bigint[]) {
  const { actor } = useActor();
  return useQuery<{ clientId: bigint; replies: ClientReply[] }[]>({
    queryKey: ["all-replies", clientIds.map(String).join(",")],
    queryFn: async () => {
      if (clientIds.length === 0) return [];
      const a = actor ?? (await getActor());
      const results = await Promise.all(
        clientIds.map(async (id) => ({
          clientId: id,
          replies: await a.getRepliesForClient(id),
        })),
      );
      return results;
    },
    enabled: clientIds.length > 0,
  });
}

export function useSenderConfig() {
  const { actor } = useActor();
  return useQuery<SenderConfig | null>({
    queryKey: ["senderConfig"],
    queryFn: async () => {
      const a = actor ?? (await getActor());
      return a.getSenderConfig();
    },
    enabled: true,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      address: string;
      notes: string;
      clientType: ClientType;
    }) => {
      const actor = await getActor();
      return actor.createClient(
        data.name,
        data.email,
        data.phone,
        data.address,
        data.notes,
        data.clientType,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      email: string;
      phone: string;
      address: string;
      notes: string;
      clientType: ClientType;
    }) => {
      const actor = await getActor();
      return actor.updateClient(
        data.id,
        data.name,
        data.email,
        data.phone,
        data.address,
        data.notes,
        data.clientType,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      const actor = await getActor();
      return actor.deleteClient(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      clientId: bigint;
      lineItems: InvoiceLineItem[];
      gstPercentage: bigint;
    }) => {
      const actor = await getActor();
      return actor.createInvoice(
        data.clientId,
        data.lineItems,
        data.gstPercentage,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      const actor = await getActor();
      return actor.deleteInvoice(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateSenderConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; phone: string }) => {
      const actor = await getActor();
      return actor.updateSenderConfig(data.email, data.phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["senderConfig"] }),
  });
}

export function useAddClientReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      clientId: bigint;
      channel: CommunicationChannel;
      message: string;
    }) => {
      const actor = await getActor();
      return actor.addClientReply(data.clientId, data.channel, data.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-replies"] }),
  });
}
