import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useCreateDonation } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { IndianRupee, HeartHandshake, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least ₹1"),
  isAnonymous: z.boolean().default(false),
  displayName: z.string().optional(),
});

export default function Donate() {
  const { user, token, authHeaders } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [donationAmount, setDonationAmount] = useState(0);

  const { mutate: createDonation, isPending } = useCreateDonation();

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 500,
      isAnonymous: false,
      displayName: user?.name || "",
    },
  });

  const isAnonymous = form.watch("isAnonymous");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      amount: values.amount,
      isAnonymous: values.isAnonymous,
      displayName: values.isAnonymous ? null : (values.displayName || user?.name || ""),
    };

    createDonation(
      { data: payload },
      {
        onSuccess: () => {
          setDonationAmount(values.amount);
          setStep(2);
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: err.error || "Failed to initiate donation. Please try again.",
          });
        },
      }
    );
  };

  const handlePaymentDone = () => {
    toast({
      title: "Thank you!",
      description: "Your donation will reflect on the website after 24 hours.",
    });
    setLocation("/");
  };

  if (!token) return null;

  return (
    <div className="py-16 px-4 max-w-2xl mx-auto min-h-[calc(100vh-5rem)]">
      <div className="text-center mb-10">
        <HeartHandshake className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold text-foreground">Make a Donation</h1>
        <p className="text-muted-foreground mt-2">Support our cow welfare drives with a generous contribution.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Amount */}
                <div className="space-y-4">
                  <label className="text-base font-semibold text-foreground">Donation Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input 
                      type="number" 
                      {...form.register("amount")} 
                      className="pl-12 text-xl font-bold h-14" 
                      placeholder="Enter amount"
                    />
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                  )}

                  {/* Quick Select Buttons */}
                  <div className="flex gap-3 pt-2">
                    {[101, 501, 1100, 2100].map(amt => (
                      <Button 
                        key={amt} 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => form.setValue('amount', amt)}
                      >
                        ₹{amt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Anonymous Toggle */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-xl">
                    <div className="space-y-0.5">
                      <h4 className="font-medium text-foreground">Donate Anonymously</h4>
                      <p className="text-sm text-muted-foreground">Your name will be hidden from the public list.</p>
                    </div>
                    <Switch 
                      checked={isAnonymous} 
                      onCheckedChange={(val) => form.setValue('isAnonymous', val)} 
                    />
                  </div>

                  {!isAnonymous && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-foreground">Display Name</label>
                      <Input {...form.register("displayName")} placeholder="How should we show your name?" />
                    </motion.div>
                  )}
                </div>

                <Button type="submit" className="w-full h-14 text-lg" disabled={isPending}>
                  {isPending ? "Processing..." : "Proceed to Pay"}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-8 text-center border-primary/20">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <IndianRupee className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Scan and pay <strong className="text-foreground font-bold">₹{donationAmount}</strong> via UPI
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-inner border max-w-xs mx-auto mb-8">
                <img 
                  src={`${import.meta.env.BASE_URL}images/qr-placeholder.png`} 
                  alt="UPI QR Code" 
                  className="w-full h-auto rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <Button onClick={handlePaymentDone} className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white shadow-green-600/20">
                  <CheckCircle2 className="mr-2 h-5 w-5" /> I have completed the payment
                </Button>
                <p className="text-sm text-muted-foreground">
                  Admin will verify and approve your donation within 24 hours.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
