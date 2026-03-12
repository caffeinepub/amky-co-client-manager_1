import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type ClientType = { #itr; #gst; #both };
  type CommunicationChannel = { #email; #whatsapp };

  type Client = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    notes : Text;
    clientType : ClientType;
  };

  type InvoiceLineItem = {
    description : Text;
    quantity : Nat;
    unitPrice : Nat;
  };

  type Invoice = {
    id : Nat;
    clientId : Nat;
    lineItems : [InvoiceLineItem];
    gstPercentage : Nat;
    totalAmount : Nat;
    createdAt : Time.Time;
  };

  type ClientReply = {
    id : Nat;
    clientId : Nat;
    channel : CommunicationChannel;
    message : Text;
    timestamp : Time.Time;
  };

  type SenderConfig = {
    email : Text;
    phone : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  module Client {
    public func compareByName(a : Client, b : Client) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  // Persistent State
  let clients = Map.empty<Nat, Client>();
  let invoices = Map.empty<Nat, Invoice>();
  let replies = Map.empty<Nat, ClientReply>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextClientId = 1;
  var nextInvoiceId = 1;
  var nextReplyId = 1;
  var senderConfig : ?SenderConfig = null;

  // USER PROFILE MANAGEMENT

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // CLIENT MANAGEMENT

  public shared ({ caller }) func createClient(name : Text, email : Text, phone : Text, address : Text, notes : Text, clientType : ClientType) : async Nat {
    let client : Client = {
      id = nextClientId;
      name;
      email;
      phone;
      address;
      notes;
      clientType;
    };

    clients.add(nextClientId, client);
    nextClientId += 1;
    client.id;
  };

  public shared ({ caller }) func updateClient(id : Nat, name : Text, email : Text, phone : Text, address : Text, notes : Text, clientType : ClientType) : async () {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?_) {
        let updatedClient : Client = {
          id;
          name;
          email;
          phone;
          address;
          notes;
          clientType;
        };
        clients.add(id, updatedClient);
      };
    };
  };

  public shared ({ caller }) func deleteClient(id : Nat) : async () {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?_) {
        clients.remove(id);
      };
    };
  };

  public query ({ caller }) func getClient(id : Nat) : async ?Client {
    clients.get(id);
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    clients.values().toArray().sort(Client.compareByName);
  };

  // INVOICE MANAGEMENT

  public shared ({ caller }) func createInvoice(clientId : Nat, lineItems : [InvoiceLineItem], gstPercentage : Nat) : async Nat {
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client not found") };
      case (?_) {
        let totalAmount = calculateTotal(lineItems, gstPercentage);
        if (lineItems.size() == 0) {
          Runtime.trap("Invoice must have at least one line item");
        };

        let invoice : Invoice = {
          id = nextInvoiceId;
          clientId;
          lineItems;
          gstPercentage;
          totalAmount;
          createdAt = Time.now();
        };

        invoices.add(nextInvoiceId, invoice);
        nextInvoiceId += 1;
        invoice.id;
      };
    };
  };

  func calculateTotal(lineItems : [InvoiceLineItem], gstPercentage : Nat) : Nat {
    let totalWithoutGst = switch (lineItems.size()) {
      case (0) { 0 };
      case (_) {
        var sum = 0;
        for (item in lineItems.values()) {
          sum += item.quantity * item.unitPrice;
        };
        sum;
      };
    };

    let gst = (totalWithoutGst * gstPercentage) / 100;
    totalWithoutGst + gst;
  };

  public shared ({ caller }) func updateInvoice(id : Nat, clientId : Nat, lineItems : [InvoiceLineItem], gstPercentage : Nat) : async () {
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?_) {
        if (lineItems.size() == 0) {
          Runtime.trap("Invoice must have at least one line item");
        };

        switch (clients.get(clientId)) {
          case (null) { Runtime.trap("Client not found") };
          case (?_) {
            let updatedInvoice : Invoice = {
              id;
              clientId;
              lineItems;
              gstPercentage;
              totalAmount = calculateTotal(lineItems, gstPercentage);
              createdAt = Time.now();
            };
            invoices.add(id, updatedInvoice);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteInvoice(id : Nat) : async () {
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?_) {
        invoices.remove(id);
      };
    };
  };

  public query ({ caller }) func getInvoice(id : Nat) : async ?Invoice {
    invoices.get(id);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    invoices.values().toArray();
  };

  // CLIENT REPLIES

  public shared ({ caller }) func addClientReply(clientId : Nat, channel : CommunicationChannel, message : Text) : async Nat {
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client not found") };
      case (?_) {
        if (message.isEmpty()) {
          Runtime.trap("Message cannot be empty");
        };

        let reply : ClientReply = {
          id = nextReplyId;
          clientId;
          channel;
          message;
          timestamp = Time.now();
        };

        replies.add(nextReplyId, reply);
        nextReplyId += 1;
        reply.id;
      };
    };
  };

  public query ({ caller }) func getRepliesForClient(clientId : Nat) : async [ClientReply] {
    let filteredReplies = replies.values().toArray().filter(
      func(r) { r.clientId == clientId }
    );
    filteredReplies;
  };

  // SENDER CONFIG

  public shared ({ caller }) func updateSenderConfig(email : Text, phone : Text) : async () {
    if (email.isEmpty() or phone.isEmpty()) {
      Runtime.trap("Email and phone cannot be empty");
    };

    senderConfig := ?{
      email;
      phone;
    };
  };

  public query ({ caller }) func getSenderConfig() : async ?SenderConfig {
    senderConfig;
  };
};
