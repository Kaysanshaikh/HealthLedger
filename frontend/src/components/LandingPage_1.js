import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "./NavBar";
import { Button } from "./ui/button";
import { ShieldCheck, Lock, User, FileText, Share2, Zap } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-card p-6 rounded-lg shadow-md text-center flex flex-col items-center">
    <div className="flex-shrink-0">{icon}</div>
    <h3 className="text-xl font-semibold text-primary mt-4 mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-foreground">
      <NavBar />

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Health, Your Data, Your Control
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            HealthLedger is a decentralized platform that empowers you to securely own and manage your medical records using blockchain technology.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg" onClick={() => navigate("/login")}>
              Access Your Health Records
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose HealthLedger?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck size={48} className="text-primary" />}
              title="Unmatched Security"
              description="Leveraging the immutability of blockchain, your records are tamper-proof and secure."
            />
            <FeatureCard
              icon={<Lock size={48} className="text-primary" />}
              title="Complete Privacy"
              description="With decentralized storage on IPFS, only you and those you authorize can access your data."
            />
            <FeatureCard
              icon={<User size={48} className="text-primary" />}
              title="Patient-Centric Control"
              description="You are the gatekeeper. Grant or revoke access to your health records at any time."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">A Simple, Secure Process</h2>
          <div className="flex flex-col md:flex-row items-start justify-center gap-12 max-w-5xl mx-auto">
            <motion.div 
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-2">1. Create Your Identity</h3>
              <p className="text-muted-foreground">Securely connect your digital wallet to establish your decentralized identity on HealthLedger.</p>
            </motion.div>
            <motion.div 
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Share2 size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-2">2. Manage Your Records</h3>
              <p className="text-muted-foreground">Your health records are uploaded and encrypted, then stored on the decentralized IPFS network.</p>
            </motion.div>
            <motion.div 
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-2">3. Control Access</h3>
              <p className="text-muted-foreground">Use our intuitive dashboard to grant or revoke access to doctors and specialists with a single click.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
