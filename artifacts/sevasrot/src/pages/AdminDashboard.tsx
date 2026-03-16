import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { 
  useGetPendingDonations, 
  useGetAllDonations, 
  useGetAllDrives, 
  useApproveDonation, 
  useRejectDonation,
  useDeleteDrive
} from "@workspace/api-client-react";
import { useCreateDriveWithImages } from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, X, Trash2, Edit, Plus, Image as ImageIcon, 
  Clock, CheckCircle2, List, Settings 
} from "lucide-react";
import { motion } from "framer-motion";

const driveSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  date: z.string(),
  images: z.any().optional(),
});

export default function AdminDashboard() {
  const { user, token, isAdmin, authHeaders } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "drives">("pending");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!token || !isAdmin) {
      setLocation("/");
    }
  }, [token, isAdmin, setLocation]);

  // Queries
  const reqOpts = { request: { headers: authHeaders } };
  const { data: pendingDonations, isLoading: loadingPending } = useGetPendingDonations(reqOpts);
  const { data: allDonations, isLoading: loadingAll } = useGetAllDonations(reqOpts);
  const { data: drives, isLoading: loadingDrives } = useGetAllDrives(reqOpts);

  // Mutations
  const { mutate: approve } = useApproveDonation({ ...reqOpts });
  const { mutate: reject } = useRejectDonation({ ...reqOpts });
  const { mutate: deleteD, isPending: deletingDrive } = useDeleteDrive({ ...reqOpts });
  const { mutate: createDrive, isPending: creatingDrive } = useCreateDriveWithImages();

  const handleApprove = (id: number) => {
    approve({ id }, {
      onSuccess: () => {
        toast({ title: "Donation Approved" });
        queryClient.invalidateQueries({ queryKey: ["/api/donations/pending"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-count"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/all-donations"] });
      }
    });
  };

  const handleReject = (id: number) => {
    reject({ id }, {
      onSuccess: () => {
        toast({ title: "Donation Rejected", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: ["/api/donations/pending"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-count"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/all-donations"] });
      }
    });
  };

  const handleDeleteDrive = (id: number) => {
    if(confirm("Are you sure you want to delete this drive?")) {
      deleteD({ id }, {
        onSuccess: () => {
          toast({ title: "Drive deleted successfully" });
          queryClient.invalidateQueries({ queryKey: ["/api/drives"] });
        }
      });
    }
  };

  const form = useForm<z.infer<typeof driveSchema>>({
    resolver: zodResolver(driveSchema),
    defaultValues: { title: "", description: "", location: "", date: "" },
  });

  const onSubmitDrive = (values: z.infer<typeof driveSchema>) => {
    createDrive(
      { ...values, images: values.images },
      {
        onSuccess: () => {
          toast({ title: "Seva Drive Created" });
          form.reset();
          setShowCreateForm(false);
        }
      }
    );
  };

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/50 bg-card p-6 hidden md:block">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Admin Panel</h2>
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === 'pending' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary'}`}
          >
            <div className="flex items-center gap-3"><Clock className="h-5 w-5" /> Pending</div>
            {pendingDonations && pendingDonations.length > 0 && (
              <Badge variant="destructive" className="ml-auto">{pendingDonations.length}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'all' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary'}`}
          >
            <CheckCircle2 className="h-5 w-5" /> All Donations
          </button>
          <button
            onClick={() => setActiveTab("drives")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'drives' ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary'}`}
          >
            <List className="h-5 w-5" /> Manage Drives
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Mobile Tab Selector */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4">
          <Button variant={activeTab === 'pending' ? 'default' : 'outline'} onClick={() => setActiveTab("pending")} className="shrink-0">Pending</Button>
          <Button variant={activeTab === 'all' ? 'default' : 'outline'} onClick={() => setActiveTab("all")} className="shrink-0">All Donations</Button>
          <Button variant={activeTab === 'drives' ? 'default' : 'outline'} onClick={() => setActiveTab("drives")} className="shrink-0">Seva Drives</Button>
        </div>

        {activeTab === "pending" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold mb-8">Pending Approvals</h1>
            {loadingPending ? <p>Loading...</p> : pendingDonations?.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground border-dashed">No pending donations to review.</Card>
            ) : (
              <div className="space-y-4">
                {pendingDonations?.map(donation => (
                  <Card key={donation.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-foreground">{formatCurrency(donation.amount)}</span>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">{donation.userName}</strong> ({donation.userEmail})
                      </p>
                      <p className="text-sm text-muted-foreground flex gap-4">
                        <span>Date: {format(new Date(donation.createdAt), 'PP')}</span>
                        <span>Display Name: {donation.isAnonymous ? "Anonymous" : donation.displayName}</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => handleApprove(donation.id)} className="bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </Button>
                      <Button onClick={() => handleReject(donation.id)} variant="destructive">
                        <X className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "all" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold mb-8">All Donations</h1>
            {loadingAll ? <p>Loading...</p> : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Donor</th>
                        <th className="px-6 py-4 font-medium">Display Name</th>
                        <th className="px-6 py-4 font-medium">Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {allDonations?.map(d => (
                        <tr key={d.id} className="hover:bg-secondary/20">
                          <td className="px-6 py-4">{format(new Date(d.createdAt), 'PP')}</td>
                          <td className="px-6 py-4 font-medium">{d.userName}</td>
                          <td className="px-6 py-4 text-muted-foreground">{d.isAnonymous ? "Anonymous" : d.displayName}</td>
                          <td className="px-6 py-4 font-bold">{formatCurrency(d.amount)}</td>
                          <td className="px-6 py-4">
                            {d.status === 'approved' && <Badge variant="success">Approved</Badge>}
                            {d.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                            {d.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "drives" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Manage Seva Drives</h1>
              <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
                {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showCreateForm ? "Cancel" : "New Drive"}
              </Button>
            </div>

            {showCreateForm && (
              <Card className="p-8 mb-10 border-primary/20 bg-primary/5">
                <h2 className="text-xl font-bold mb-6">Create New Seva Drive</h2>
                <form onSubmit={form.handleSubmit(onSubmitDrive)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input {...form.register("title")} placeholder="E.g., Winter Feeding Camp" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input {...form.register("location")} placeholder="Gaushala Name, City" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" {...form.register("date")} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea {...form.register("description")} placeholder="Describe the activities..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Upload Images (Max 10)
                    </label>
                    <Input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      className="pt-2.5"
                      {...form.register("images")} 
                    />
                  </div>

                  <Button type="submit" disabled={creatingDrive} className="w-full">
                    {creatingDrive ? "Uploading & Creating..." : "Publish Seva Drive"}
                  </Button>
                </form>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loadingDrives ? <p>Loading...</p> : drives?.map(drive => (
                <Card key={drive.id} className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-24 bg-secondary rounded-xl overflow-hidden shrink-0">
                    {drive.images && drive.images.length > 0 ? (
                      <img src={drive.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon /></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold line-clamp-1">{drive.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{format(new Date(drive.date), 'PP')} • {drive.location}</p>
                    <div className="mt-auto flex gap-2">
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteDrive(drive.id)} disabled={deletingDrive} className="ml-auto">
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
