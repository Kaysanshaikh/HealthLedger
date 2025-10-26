import React from "react";
import NavBar from "./NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Linkedin } from 'lucide-react';

const teamMembers = [
  {
    name: "Kaysan Shaikh",
    role: "Team Leader & Lead Developer",
    contribution: "Kaysan led the project from conception to deployment, overseeing all phases of development. He single-handedly redesigned and re-engineered the entire user interface and experience—covering both the frontend and backend. Additionally, he implemented a PostgreSQL database and integrated Pinata for decentralized file.",
    linkedin: "https://www.linkedin.com/in/kaysanshaikh/",
  },
  {
    name: "Meghavi Bansod",
    role: "IPFS Specialist",
    contribution: "Meghavi was responsible for the initial design and implementation of the InterPlanetary File System (IPFS) integration within the project. She focused on enabling decentralized, tamper-proof, and scalable storage to securely manage and retrieve sensitive medical records across the network.",
    linkedin: "https://www.linkedin.com/in/meghavi-bansod-337182223/",
  },
  {
    name: "Harsh Patil",
    role: "Initial Frontend Development",
    contribution: "Harsh laid the foundational groundwork for the frontend, creating the initial user interface that was later evolved and redesigned.",
    linkedin: "https://www.linkedin.com/in/harsh-patil-511454373/",
  },
  {
    name: "Shubham Shrivastav",
    role: "Initial Frontend Development",
    contribution: "Shubham laid the foundational groundwork for the frontend, creating the initial user interface that was later evolved and redesigned.",
    linkedin: "https://www.linkedin.com/in/shubham-shrivastav-911078294/",
  },
];

const TeamMemberCard = ({ member }) => (
  <Card>
    <CardHeader>
      <CardTitle>{member.name}</CardTitle>
      <p className="text-sm text-muted-foreground">{member.role}</p>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-4">{member.contribution}</p>
      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
        <Linkedin size={16} />
        View LinkedIn
      </a>
    </CardContent>
  </Card>
);

const TeamPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Team</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            The dedicated individuals behind HealthLedger.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
