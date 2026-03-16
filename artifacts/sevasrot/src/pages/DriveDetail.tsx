import { useRoute } from "wouter";
import { useGetDrive } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowLeft, Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function DriveDetail() {
  const [, params] = useRoute("/drives/:id");
  const driveId = parseInt(params?.id || "0");

  const { data: drive, isLoading, error } = useGetDrive(driveId, {
    query: { enabled: !!driveId }
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Drive not found</h2>
        <p className="text-muted-foreground mb-6">The seva drive you're looking for doesn't exist.</p>
        <Link href="/drives">
          <Button variant="outline">Back to Drives</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/drives">
        <Button variant="ghost" className="mb-8 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Drives
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
            {drive.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{format(new Date(drive.date), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{drive.location}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 shadow-lg mb-12">
          <div className="prose prose-orange max-w-none dark:prose-invert">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary/20" /> About this Seva
            </h3>
            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {drive.description}
            </p>
          </div>
        </div>

        {/* Gallery */}
        {drive.images && drive.images.length > 0 && (
          <div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-8">Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {drive.images.map((img, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square rounded-2xl overflow-hidden shadow-md bg-secondary"
                >
                  <img 
                    src={img} 
                    alt={`Gallery image ${i + 1}`} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
