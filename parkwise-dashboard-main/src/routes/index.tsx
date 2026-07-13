import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Shield, User, Zap, Car, ChevronRight, BarChart3, Wallet, Search,
  Receipt, Clock, MapPin, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Park - Your Seemless Parking Assistant" },
      { name: "description", content: "Experience seamless parking with Smart Park. Effortlessly book, manage, and find parking slots instantly." },
    ],
  }),
  component: Landing,
});

const portals = [
  {
    title: "Admin Portal",
    icon: Shield,
    gradient: "gradient-primary",
    cta: "Enter Admin Portal",
    to: "/admin/login",
    features: [
      { icon: MapPin, text: "Manage parking sites" },
      { icon: BarChart3, text: "Analytics & reports" },
      { icon: Clock, text: "Monitor occupancy" },
      { icon: Search, text: "Search vehicles" },
    ],
  },
  {
    title: "Regular User",
    icon: User,
    gradient: "gradient-success",
    cta: "Login / Signup",
    to: "/user/login",
    features: [
      { icon: MapPin, text: "Book parking slots" },
      { icon: Wallet, text: "Wallet payments" },
      { icon: Receipt, text: "Parking history" },
      { icon: Clock, text: "Real-time availability" },
    ],
  },
  {
    title: "Walk-In User",
    icon: Zap,
    gradient: "gradient-warning",
    cta: "Walk-In Parking",
    to: "/walkin",
    features: [
      { icon: Zap, text: "Instant parking" },
      { icon: Receipt, text: "Receipt generation" },
      { icon: ChevronRight, text: "Quick checkout" },
      { icon: CreditCard, text: "Easy payment" },
    ],
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Nav */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">SmartPark</span>
        </div>
        <div className="flex gap-2">
          <Link to="/walkin"><Button variant="ghost" size="sm">Walk-in</Button></Link>
          <Link to="/user/login"><Button variant="outline" size="sm">Login</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-12 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            Smart Parking <span className="text-gradient">Management System</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Efficient, secure and smart parking management — for administrators, registered drivers, and walk-in visitors.
          </p>
        </motion.div>
      </section>

      {/* Portals */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {portals.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-3xl p-8 bg-card border border-border shadow-card"
            >
              <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full ${p.gradient} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
              <div className={`w-14 h-14 rounded-2xl ${p.gradient} grid place-items-center shadow-glow`}>
                <p.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-5 text-2xl font-bold">{p.title}</h3>
              <ul className="mt-5 space-y-3">
                {p.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-muted grid place-items-center text-foreground/70">
                      <f.icon className="h-3.5 w-3.5" />
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link to={p.to} className="block mt-7">
                <Button className={`w-full ${p.gradient} text-white hover:opacity-90 border-0 shadow-glow`}>
                  {p.cta} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        &copy; 2026 Smart Park. All Rights Reserved
      </footer>
    </div>
  );
}
