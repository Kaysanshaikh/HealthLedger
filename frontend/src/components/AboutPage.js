import React from "react";
import { motion } from "framer-motion";
import NavBar from "./NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Heart, FlaskConical } from 'lucide-react';

const SectionCard = ({ icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  </motion.div>
);

const AboutUs = () => {
  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About HealthLedger</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            Revolutionizing healthcare by putting patients in control of their medical data through secure, decentralized technology.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-1">
          <SectionCard icon={<Users className="h-8 w-8 text-primary" />} title="Who We Are">
            <p className="text-muted-foreground">
              We are a dedicated team of healthcare professionals and technologists committed to revolutionizing the way Electronic Health Records (EHR) are managed. Our mission is to provide a secure, efficient, and user-friendly platform for managing EHR.
            </p>
          </SectionCard>

          <SectionCard icon={<Heart className="h-8 w-8 text-primary" />} title="What We Do" delay={0.2}>
            <p className="text-muted-foreground mb-4">
              Our EHR management system provides a comprehensive solution for Doctors, Patients, and Diagnostic Centers. We leverage the power of the Polygon blockchain for secure data storage and smart contracts for access control and data management.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>For Patients:</strong> View your own medical records, upload new documents, and grant or revoke access to doctors.</li>
              <li><strong>For Doctors:</strong> Access patient records (with permission), view medical history, and manage treatment plans.</li>
              <li><strong>For Diagnostic Centers:</strong> Upload EHR reports directly to a patient's record securely.</li>
            </ul>
          </SectionCard>

          <SectionCard icon={<FlaskConical className="h-8 w-8 text-primary" />} title="Our Commitment" delay={0.4}>
            <p className="text-muted-foreground">
              We are committed to ensuring the integrity and security of patient data. Our system ensures that only authorized users have access to patient records. Patients have full control over who can access their medical records and can grant or revoke access as needed.
            </p>
          </SectionCard>
        </div>

        <footer className="text-center mt-12">
          <p className="text-muted-foreground">Have questions? Contact us at <a href="mailto:contact@healthledger.com" className="text-primary hover:underline">contact@healthledger.com</a></p>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;
