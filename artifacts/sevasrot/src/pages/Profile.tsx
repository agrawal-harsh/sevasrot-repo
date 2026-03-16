import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyDonations } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { User, Mail, Calendar, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, token, authHeaders } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  const { data: donations, isLoading } = useGetMyDonations({
    query: { enabled: !!token },
    request: { headers: authHeaders }
  });

  if (!user) return null;

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-display font-bold text-foreground mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
          <Card className="p-8 text-center sticky top-24">
            <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="text-left bg-secondary/50 p-4 rounded-xl text-sm">
              <p className="text-muted-foreground mb-1">Account Created</p>
              <p className="font-medium text-foreground">{format(new Date(user.createdAt), 'MMMM d, yyyy')}</p>
            </div>
          </Card>
        </motion.div>

        {/* Donations List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-6 py-5 border-b border-border/50 bg-secondary/30">
              <h3 className="text-xl font-bold">My Donations</h3>
            </div>
            
            {isLoading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : donations && donations.length > 0 ? (
              <div className="divide-y divide-border/50">
                {donations.map((d) => (
                  <div key={d.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold text-foreground">{formatCurrency(d.amount)}</span>
                        {d.status === "approved" && <Badge variant="success">Approved</Badge>}
                        {d.status === "pending" && <Badge variant="warning">Pending Review</Badge>}
                        {d.status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {format(new Date(d.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    <div className="bg-secondary/30 px-3 py-2 rounded-lg text-sm self-start sm:self-auto">
                      <span className="text-muted-foreground">Shown as: </span>
                      <span className="font-medium">{d.isAnonymous ? "Anonymous" : d.displayName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Info className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p>You haven't made any donations yet.</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
