"use client";

import Link from "next/link";
import { ArrowLeft, Github, Linkedin, Database, Code, Zap, ShieldCheck, Share2, Terminal, Globe, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, MouseEvent } from "react";
import Tilt from 'react-parallax-tilt';
import { motion } from "framer-motion"; 

// --- 1. DECRYPT TEXT COMPONENT ---
const DecryptText = ({ text, className }: { text: string, className?: string }) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const animate = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayText(prev => 
        text.split("").map((letter, index) => {
          if (index < iteration) return text[index];
          return letters[Math.floor(Math.random() * 26)];
        }).join("")
      );
      if (iteration >= text.length) if (intervalRef.current) clearInterval(intervalRef.current);
      iteration += 1 / 3;
    }, 30);
  };
  useEffect(() => { animate(); return () => { if(intervalRef.current) clearInterval(intervalRef.current); } }, []);
  return <span onMouseEnter={animate} className={className}>{displayText}</span>;
};

export default function TeamPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const teamMembers = [
    {
      name: "Arshi Chakma",
      role: "Research Intern",
      organization: "The Dissent",
      icon: <Database size={24} />,
      color: "text-emerald-600",
      bg: "bg-emerald-500",
      image: "/team/arshi.jpg",
      desc: "Architecting information pipelines and managing high-volume verification datasets.",
      socials: {
        github: "",
        linkedin: "https://www.linkedin.com/in/arshi-chakma-c00/",
        portfolio: "" 
      }
    },
    {
      name: "Minhaj Aman",
      role: "Project Coordinator",
      organization: "Activate Rights", 
      icon: <Zap size={24} />,
      color: "text-amber-600",
      bg: "bg-amber-500",
      image: "/team/minhaj.jpg",
      desc: "Orchestrating workflow and ensuring forensic integrity across all data vectors.",
      socials: {
        github: "",
        linkedin: "https://www.linkedin.com/in/minhajaman/",
        portfolio: "" 
      }
    },
    {
      name: "Jobair Ahmed",
      role: "Data Lead",
      organization: "Activate Rights",
      icon: <Database size={24} />,
      color: "text-emerald-600",
      bg: "bg-emerald-500",
      image: "/team/Jobair.jpg",
      desc: "Architecting information pipelines and managing high-volume verification datasets.",
      socials: {
        github: "",
        linkedin: "https://www.linkedin.com/in/mohammad-jobair-ahmad/",
        portfolio: "" 
      }
    },
    {
      name: "Kazi Rohanuzzaman Mehal",
      role: "Tech Lead",
      organization: "Activate Rights",
      icon: <Code size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-500",
      image: "/team/Mehal.jpg",
      desc: "Developing the core infrastructure, full-stack logic, and automated archival systems.",
      socials: {
        github: "https://github.com/MihalKazi",
        linkedin: "https://www.linkedin.com/in/kazi-rohanuzzaman-mehal07/",
        portfolio: "" 
      }
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 font-sans overflow-x-hidden relative text-slate-900">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-100/40 via-white to-transparent blur-3xl opacity-60" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="backdrop-blur-xl bg-white/80 border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-[#1e3a5f]" />
                <span className="font-bold tracking-tight text-sm text-[#1e3a5f]">GNG REPOSITORY</span>
            </div>
            <Link href="/" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all border border-slate-200 rounded-full hover:bg-[#1e3a5f] hover:border-[#1e3a5f]">
                Back to Archive
            </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header */}
        <div className={`text-center max-w-4xl mx-auto mb-24 transition-all duration-1000 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="flex items-center gap-1">
                <Terminal size={10} /> SYSTEM_ARCHITECTS
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Constructing the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-[#1e3a5f] to-emerald-600 animate-gradient-x">
                GNG Infrastructure
            </span>
          </h1>
        </div>

        {/* --- SCALABLE GRID --- */}
        <motion.div 
            onMouseMove={handleMouseMove}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-4 group/grid relative"
        >
          
          <div 
            className="absolute -inset-20 opacity-0 group-hover/grid:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
            style={{
                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`
            }}
          />

          {teamMembers.map((member, idx) => (
            <motion.div key={idx} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }}} className="h-full">
                <Tilt 
                    tiltMaxAngleX={4} tiltMaxAngleY={4} perspective={1000} 
                    glareEnable={true} glareMaxOpacity={0.4} glareColor="#ffffff" glarePosition="all" 
                    scale={1.02} className="h-full"
                >
                <div className={`group relative h-full bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10`}>
                    
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-[2.5rem] transition-colors duration-300 pointer-events-none z-20"></div>

                    <div className="p-8 flex flex-col items-center text-center relative z-10 h-full">
                        
                        <div className={`absolute top-0 inset-x-0 h-40 ${member.bg} blur-[90px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

                        {/* Avatar */}
                        <div className="relative mb-6 mt-4">
                            <div className={`absolute inset-0 -m-4 border border-dashed border-slate-200 rounded-full animate-[spin_12s_linear_infinite] group-hover:border-slate-300 transition-colors`}></div>
                            <div className="relative w-32 h-32 rounded-full p-1 bg-white shadow-lg z-10">
                                <img 
                                  src={member.image} 
                                  alt={member.name} 
                                  className="w-full h-full rounded-full object-cover transition-all duration-500" 
                                />
                            </div>
                            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl ${member.bg} text-white flex items-center justify-center shadow-lg shadow-slate-400/20 z-20`}>
                                {member.icon}
                            </div>
                        </div>

                        {/* Name & Role */}
                        <h3 className="text-2xl font-black text-slate-800 mb-1 min-h-[2rem] leading-tight cursor-default">
                            <DecryptText text={member.name} />
                        </h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${member.color} mb-3`}>{member.role}</p>
                        
                        {/* --- ORGANIZATION BADGE ONLY --- */}
                        <div className="flex items-center justify-center mb-6 w-full">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-semibold text-slate-500 group-hover:bg-[#1e3a5f] group-hover:text-white group-hover:border-[#1e3a5f] transition-all duration-300">
                                <Building2 size={10} />
                                {member.organization}
                            </div>
                        </div>

                        <div className="w-8 h-px bg-slate-100 mb-6 group-hover:w-16 group-hover:bg-slate-300 transition-all duration-500"/>

                        {/* Description */}
                        <p className="text-sm text-slate-500 leading-relaxed font-medium pb-8 mb-auto">
                            {member.desc}
                        </p>

                        {/* Socials */}
                        <div className="flex gap-3 pt-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                            {member.socials.github && (
                                <SocialButton href={member.socials.github} icon={<Github size={18} />} />
                            )}
                            {member.socials.linkedin && (
                                <SocialButton href={member.socials.linkedin} icon={<Linkedin size={18} />} />
                            )}
                            {member.socials.portfolio && (
                                <SocialButton href={member.socials.portfolio} icon={<Globe size={18} />} />
                            )}
                        </div>

                        {/* Tech Corners */}
                        <div className="absolute top-6 right-6 w-2 h-2 border-t border-r border-slate-200 group-hover:border-blue-400 transition-colors" />
                        <div className="absolute bottom-6 left-6 w-2 h-2 border-b border-l border-slate-200 group-hover:border-blue-400 transition-colors" />
                    </div>
                </div>
                </Tilt>
            </motion.div>
          ))}
        </motion.div>

        {/* Back Button */}
        <div className="mt-28 flex justify-center pb-12">
            <button onClick={() => router.back()} className="group relative px-8 py-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-[#1e3a5f] translate-y-[102%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <div className="relative flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-white transition-colors duration-300">
                    <ArrowLeft size={16} /> Return to Dashboard
                </div>
            </button>
        </div>

      </main>

      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
}

function SocialButton({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2.5 text-slate-400 bg-slate-50 rounded-lg hover:bg-[#1e3a5f] hover:text-white transition-all shadow-sm flex items-center justify-center"
        >
            {icon}
        </a>
    )
}