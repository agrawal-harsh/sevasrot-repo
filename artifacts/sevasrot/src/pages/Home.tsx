import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Calendar, MapPin, IndianRupee } from "lucide-react";
import { useGetApprovedDonations, useGetAllDrives } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { data: donationsData } = useGetApprovedDonations();
  const { data: drivesData } = useGetAllDrives();

  const recentDrives = drivesData?.slice(0, 3) || [];
  const totalAmount = donationsData?.total || 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Beautiful cow in meadow" 
            className="w-full h-full object-cover opacity-15 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
              <Heart className="h-4 w-4 fill-primary/50" />
              <span>Dedicated to Cow Welfare & Service</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-[1.1]">
              Compassion Through <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                Continuous Seva
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our community-driven platform to support, track, and contribute to cow welfare drives across India. Every contribution brings positive change.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/donate">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-lg h-14 px-8 rounded-full">
                  Donate Now <Heart className="h-5 w-5 fill-white/20" />
                </Button>
              </Link>
              <Link href="/drives">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-lg h-14 px-8 rounded-full bg-background/50 backdrop-blur-sm">
                  View Seva Drives <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 md:p-12 text-center"
          >
            <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-wider mb-4">Total Community Impact</h3>
            <div className="flex items-center justify-center gap-2 text-5xl md:text-7xl font-bold text-foreground">
              <span className="text-primary"><IndianRupee className="h-10 w-10 md:h-14 md:w-14" /></span>
              {totalAmount.toLocaleString('en-IN')}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Approved donations contributing to active welfare drives.</p>
          </motion.div>
        </div>
      </section>

      {/* Latest Drives */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Recent Seva Drives</h2>
              <p className="text-muted-foreground max-w-2xl">Discover the recent activities and welfare camps organized by our volunteers.</p>
            </div>
            <Link href="/drives" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentDrives.map((drive, i) => (
              <motion.div
                key={drive.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/drives/${drive.id}`}>
                  <Card className="h-full group cursor-pointer border-transparent hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      {drive.images && drive.images.length > 0 ? (
                        <img 
                          src={drive.images[0]} 
                          alt={drive.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Heart className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                        {drive.title}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{format(new Date(drive.date), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="line-clamp-1">{drive.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/drives">
              <Button variant="outline" className="w-full">View All Drives</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
