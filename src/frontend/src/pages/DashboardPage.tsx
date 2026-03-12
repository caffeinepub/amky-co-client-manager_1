import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientType, useAllClients, useAllInvoices } from "@/hooks/useQueries";
import {
  Building,
  FileText,
  MessageCircle,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

type Page = "dashboard" | "clients" | "compose" | "invoices" | "replies";

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: clients, isLoading: clientsLoading } = useAllClients();
  const { data: invoices, isLoading: invoicesLoading } = useAllInvoices();

  const totalClients = clients?.length ?? 0;
  const itrClients =
    clients?.filter(
      (c) =>
        c.clientType === ClientType.itr || c.clientType === ClientType.both,
    ).length ?? 0;
  const gstClients =
    clients?.filter(
      (c) =>
        c.clientType === ClientType.gst || c.clientType === ClientType.both,
    ).length ?? 0;
  const totalInvoices = invoices?.length ?? 0;

  const stats = [
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "oklch(0.26 0.09 260)",
      loading: clientsLoading,
    },
    {
      label: "ITR Clients",
      value: itrClients,
      icon: UserCheck,
      color: "oklch(0.45 0.18 220)",
      loading: clientsLoading,
    },
    {
      label: "GST Clients",
      value: gstClients,
      icon: Building,
      color: "oklch(0.55 0.18 150)",
      loading: clientsLoading,
    },
    {
      label: "Total Invoices",
      value: totalInvoices,
      icon: FileText,
      color: "oklch(0.78 0.14 85)",
      loading: invoicesLoading,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to AMKY & Co. Client Management System
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: `${stat.color}15` }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: stat.color }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stat.loading ? (
                      <Skeleton
                        className="h-8 w-12"
                        data-ocid="dashboard.loading_state"
                      />
                    ) : (
                      <p
                        className="text-3xl font-display font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                data-ocid="dashboard.clients_button"
                onClick={() => onNavigate("clients")}
                className="gap-2"
                style={{
                  background: "oklch(0.26 0.09 260)",
                  color: "oklch(0.98 0.005 260)",
                }}
              >
                <Users className="h-4 w-4" /> Add Client
              </Button>
              <Button
                data-ocid="dashboard.compose_button"
                onClick={() => onNavigate("compose")}
                variant="outline"
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" /> Compose Message
              </Button>
              <Button
                data-ocid="dashboard.invoices_button"
                onClick={() => onNavigate("invoices")}
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-4 w-4" /> Create Invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        {clients && clients.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display">Recent Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.slice(0, 5).map((client) => (
                    <div
                      key={client.id.toString()}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.email}
                        </p>
                      </div>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            client.clientType === ClientType.gst
                              ? "oklch(0.55 0.18 150 / 0.15)"
                              : client.clientType === ClientType.itr
                                ? "oklch(0.45 0.18 220 / 0.15)"
                                : "oklch(0.78 0.14 85 / 0.15)",
                          color:
                            client.clientType === ClientType.gst
                              ? "oklch(0.40 0.15 150)"
                              : client.clientType === ClientType.itr
                                ? "oklch(0.35 0.15 220)"
                                : "oklch(0.55 0.12 85)",
                        }}
                      >
                        {client.clientType.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
