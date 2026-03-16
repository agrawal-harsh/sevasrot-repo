import { useGetAllDrives } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, MapPin, Heart, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Drives() {
  const { data: drives, isLoading, error } = useGetAllDrives();

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
        Failed to load drives. Please try again later.
      </div>
    );
  }

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Our Seva Drives</h1>
        <p className="text-lg text-muted-foreground">
          Explore the various welfare camps, feeding drives, and medical assistance programs we've organized across different locations.
        </p>
      </div>

      {drives?.length === 0 ? (
        <div className="text-center py-20 bg-secondary/50 rounded-3xl border border-dashed border-border">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">No drives found</h3>
          <p className="text-muted-foreground mt-2">Check back later for upcoming seva drives.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {drives?.map((drive, i) => (
            <motion.div
              key={drive.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/drives/${drive.id}`}>
                <Card className="h-full group cursor-pointer border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col">
                  <div className="aspect-video relative overflow-hidden bg-secondary">
                    {drive.images && drive.images.length > 0 ? (
                      <>
                        <img 
                          src={drive.images[0]} 
                          alt={drive.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {drive.images.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                            <ImageIcon className="h-3 w-3" />
                            {drive.images.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                      {drive.title}
                    </h3>
                    <div className="mt-auto space-y-3 text-sm text-muted-foreground bg-secondary/30 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-background p-1.5 rounded-md shadow-sm"><Calendar className="h-4 w-4 text-primary" /></div>
                        <span className="font-medium text-foreground">{format(new Date(drive.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-background p-1.5 rounded-md shadow-sm"><MapPin className="h-4 w-4 text-primary" /></div>
                        <span className="line-clamp-1">{drive.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
