import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface SenderConfig {
    email: string;
    phone: string;
}
export interface ClientReply {
    id: bigint;
    clientId: bigint;
    message: string;
    timestamp: Time;
    channel: CommunicationChannel;
}
export interface Invoice {
    id: bigint;
    lineItems: Array<InvoiceLineItem>;
    clientId: bigint;
    createdAt: Time;
    totalAmount: bigint;
    gstPercentage: bigint;
}
export interface Client {
    id: bigint;
    clientType: ClientType;
    name: string;
    email: string;
    address: string;
    notes: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface InvoiceLineItem {
    description: string;
    quantity: bigint;
    unitPrice: bigint;
}
export enum ClientType {
    gst = "gst",
    itr = "itr",
    both = "both"
}
export enum CommunicationChannel {
    whatsapp = "whatsapp",
    email = "email"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClientReply(clientId: bigint, channel: CommunicationChannel, message: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClient(name: string, email: string, phone: string, address: string, notes: string, clientType: ClientType): Promise<bigint>;
    createInvoice(clientId: bigint, lineItems: Array<InvoiceLineItem>, gstPercentage: bigint): Promise<bigint>;
    deleteClient(id: bigint): Promise<void>;
    deleteInvoice(id: bigint): Promise<void>;
    getAllClients(): Promise<Array<Client>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(id: bigint): Promise<Client | null>;
    getInvoice(id: bigint): Promise<Invoice | null>;
    getRepliesForClient(clientId: bigint): Promise<Array<ClientReply>>;
    getSenderConfig(): Promise<SenderConfig | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClient(id: bigint, name: string, email: string, phone: string, address: string, notes: string, clientType: ClientType): Promise<void>;
    updateInvoice(id: bigint, clientId: bigint, lineItems: Array<InvoiceLineItem>, gstPercentage: bigint): Promise<void>;
    updateSenderConfig(email: string, phone: string): Promise<void>;
}
