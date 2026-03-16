import { useGetApprovedDonations } from "@workspace/api-client-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Heart, IndianRupee, HandHeart } from "lucide-react";
import { motion } from "framer-motion";

export default function Donations() {
  const { data, isLoading, error } = useGetApprovedDonations();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-destructive">
        Failed to load donations. Please try again later.
      </div>
    );
  }

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Our Supporters</h1>
        <p className="text-lg text-muted-foreground">
          We are deeply grateful to everyone who has contributed to our cause. Your support makes our seva possible.
        </p>
      </div>

      {/* Hero Stat */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary to-orange-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-primary/20 mb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Heart className="w-48 h-48 fill-white" />
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/80 font-medium text-lg mb-2 uppercase tracking-wider">Total Approved Donations</p>
          <div className="flex items-center gap-2 text-5xl md:text-7xl font-bold">
            <IndianRupee className="h-10 w-10 md:h-16 md:w-16" />
            {data?.total.toLocaleString('en-IN')}
          </div>
        </div>
      </motion.div>

      {/* List */}
      <div className="bg-card border border-border/50 rounded-3xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50 bg-secondary/30 flex items-center gap-3">
          <HandHeart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Recent Contributions</h2>
        </div>
        
        {data?.donations.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No donations recorded yet. Be the first to contribute!
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {data?.donations.map((donation, i) => (
              <motion.div 
                key={donation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Heart className="h-6 w-6 fill-primary/20" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">
                      {donation.isAnonymous ? "Anonymous Donor" : donation.displayName || "Generous Soul"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(donation.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-xl font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-xl">
                  {formatCurrency(donation.amount)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
