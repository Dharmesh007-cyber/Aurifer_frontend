'use client'

import { useRef } from "react"
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, FileText, Shield, Globe, TrendingUp, Users, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionData {
    id: number
    title: string
    description: string
    imageUrl: string
    icon: any
    reverse: boolean
    details?: Array<{
        heading: string
        points: string[]
    }>
}

const assumptions = [
    "The assistant works best when your problem statement is clear and specific.",
    "Output quality depends on the documents and details you provide.",
    "Final files should still be reviewed by your team before sharing externally.",
]

const regulatorySnapshot = [
    {
        title: "Quick Setup",
        detail: "Create a project in minutes with client name, problem statement, and optional file uploads."
    },
    {
        title: "Live Drafting",
        detail: "The assistant and document panel update together so you can review and improve output in real time."
    },
    {
        title: "Ready-to-Share Outputs",
        detail: "Export reports, presentations, and email drafts in clean formats ready for client use."
    },
] as const

export function ParallaxScrollFeatures() {
    // Array of section data for app workflow and features
    const sections: SectionData[] = [
        {
            id: 1,
            title: "Start with Your Requirement",
            description: "Begin by entering what you need help with in simple words. Add client name if needed, and upload any reference files. The app reads this and prepares a clear starting point.",
            imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop&auto=format&q=80',
            icon: FileText,
            reverse: false
        },
        {
            id: 2,
            title: "Chat with the Assistant",
            description: "Use the chat like you are speaking to an expert. Ask questions, request changes, and refine the output until the response matches your exact business need.",
            imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop&auto=format&q=80',
            icon: Globe,
            reverse: true
        },
        {
            id: 3,
            title: "Live Document Builder",
            description: "While you chat, the document updates on the side automatically. You can also edit text manually to keep full control over structure and wording.",
            imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop&auto=format&q=80',
            icon: TrendingUp,
            reverse: false
        },
        {
            id: 4,
            title: "Smart Document Reuse",
            description: "The app can use relevant content from previously uploaded files and earlier projects, helping you avoid repeating work and maintain consistency across deliverables.",
            imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=800&fit=crop&auto=format&q=80',
            icon: Shield,
            reverse: true
        },
        {
            id: 5,
            title: "Simple Project Organization",
            description: "Every task is saved under a project so files, drafts, and outputs stay organized. This makes it easy to track progress and return to work later.",
            imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop&auto=format&q=80',
            icon: Users,
            reverse: false
        },
        {
            id: 6,
            title: "Export final report",
            description: "Once your draft is complete, export it seamlessly in the standard Aurifer format.",
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format&q=80',
            icon: Award,
            reverse: true
        }
    ]

    // Create refs and animations for each section
    const sectionRefs = sections.map(() => useRef<HTMLDivElement>(null))
    
    const scrollYProgress = sections.map((_, index) => {
        return useScroll({
            target: sectionRefs[index],
            offset: ["start end", "center start"]
        }).scrollYProgress
    })

    // Create animations for each section
    const opacityContents = scrollYProgress.map(progress => 
        useTransform(progress, [0, 0.7], [0, 1])
    )
    
    const clipProgresses = scrollYProgress.map(progress => 
        useTransform(progress, [0, 0.7], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"])
    )
    
    const translateContents = scrollYProgress.map(progress => 
        useTransform(progress, [0, 1], [-50, 0])
    )

    const scaleImages = scrollYProgress.map(progress =>
        useTransform(progress, [0, 0.7], [0.8, 1])
    )

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <div className='min-h-screen flex flex-col items-center justify-center px-4'>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold text-center text-[#162236] leading-tight'>
                        How app helps
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Intuitive, guided features that help you structure and articulate bespoke solutions, while staying aligned with Aurifer's DNA.
                    </p>
                </motion.div>
                <motion.p 
                    className='mt-16 flex items-center gap-2 text-sm text-muted-foreground'
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    SCROLL TO EXPLORE <ArrowDown size={16} />
                </motion.p>
            </div>

            {/* Parallax Feature Sections */}
            <div className="flex flex-col md:px-0 px-6">
                {sections.map((section, index) => {
                    const Icon = section.icon
                    return (
                        <div 
                            key={section.id}
                            ref={sectionRefs[index]} 
                            className={`min-h-screen flex items-center justify-center md:gap-32 lg:gap-40 gap-16 py-20 ${section.reverse ? 'md:flex-row-reverse' : ''} flex-col md:flex-row`}
                        >
                            <motion.div 
                                style={{ y: translateContents[index] }}
                                className="flex-1 max-w-xl"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <Icon className="size-6" />
                                    </div>
                                    <span className="text-sm font-semibold tracking-wider text-primary uppercase">
                                        Feature 0{section.id}
                                    </span>
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#162236] leading-tight">
                                    {section.title}
                                </h2>
                                <motion.p 
                                    style={{ y: translateContents[index] }}
                                    className="text-muted-foreground max-w-lg mt-6 text-base md:text-lg leading-relaxed"
                                >
                                    {section.description}
                                </motion.p>
                                {section.details && (
                                    <div className="mt-6 space-y-4">
                                        {section.details.map((detail) => (
                                            <div key={detail.heading} className="rounded-2xl border border-primary/20 bg-white/70 p-4">
                                                <h3 className="text-sm md:text-base font-semibold text-[#000000] mb-2">{detail.heading}</h3>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {detail.points.map((point) => (
                                                        <li key={point} className="text-sm text-[#424242] leading-relaxed">
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                            
                            <motion.div 
                                style={{ 
                                    opacity: opacityContents[index],
                                    clipPath: clipProgresses[index],
                                    scale: scaleImages[index]
                                }}
                                className="relative flex-1 max-w-lg"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-3xl blur-3xl" />
                                    <img 
                                        src={section.imageUrl} 
                                        className="relative size-72 md:size-80 lg:size-96 object-cover rounded-3xl shadow-2xl" 
                                        alt={section.title}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )
                })}
            </div>

            {/* Notes for Better Results */}
            <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="px-4 py-20"
            >
                <div className="max-w-6xl mx-auto rounded-3xl border border-primary/20 bg-white/80 p-8 md:p-10 shadow-lg">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#000000]">Notes for Better Results</h2>
                    <ul className="mt-6 list-disc pl-6 space-y-3 text-[#424242]">
                        {assumptions.map((item) => (
                            <li key={item} className="leading-relaxed">{item}</li>
                        ))}
                    </ul>
                </div>
            </motion.section>

            {/* Quick Feature Snapshot */}
            <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="px-4 pb-20"
            >
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-[#000000] mb-8">Quick Feature Snapshot</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {regulatorySnapshot.map((item) => (
                            <div key={item.title} className="rounded-2xl border border-primary/20 bg-white p-5">
                                <p className="text-base font-semibold text-[#000000]">{item.title}</p>
                                <p className="text-sm text-[#424242] mt-2 leading-relaxed">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Contact & Footer Section */}
            <div className='min-h-screen flex flex-col justify-center px-4 bg-[#424242] text-white'>
                <div className="max-w-7xl mx-auto w-full py-16">
                    {/* CTA Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className='text-5xl md:text-6xl lg:text-7xl font-bold mb-6'>
                            Contact AURIFER for Advice
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h3 className="text-2xl font-bold mb-6 text-orange-400">Get in Touch</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-4">
                                    <span className="font-semibold text-white/90 min-w-[80px]">CALL US</span>
                                    <a href="tel:+97145684282" className="text-white/80 hover:text-orange-400 transition-colors">+971 4 568 4282</a>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="font-semibold text-white/90 min-w-[80px]">MAIL</span>
                                    <a href="mailto:info@aurifer.tax" className="text-white/80 hover:text-orange-400 transition-colors">info@aurifer.tax</a>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-6 text-orange-400">Our Offices</h3>
                            
                            <div className="space-y-4 text-sm text-white/70">
                                <div>
                                    <p className="font-semibold text-white mb-1">Dubai</p>
                                    <p>JBC4 3802, Cluster N, Jumeirah Lakes Towers, Dubai, UAE</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white mb-1">Abu Dhabi</p>
                                    <p>201, 14th floor, Al Sarab Tower, ADGM Square, Abu Dhabi, U.A.E.</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white mb-1">Riyadh</p>
                                    <p>Al Anoud Tower L18, Office 1802 King Fahad Road, Riyadh, Saudi Arabia</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-white mb-1">Doha</p>
                                    <p>Regus Business Centre, Floor No. 2, D Ring Road, Al Mataar, Al Qadeer District, Doha, Qatar</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Follow Us & Newsletter */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h3 className="text-2xl font-bold mb-6 text-orange-400">Follow Us</h3>
                            
                            <div className="flex gap-4 mb-12">
                                <a 
                                    href="https://www.linkedin.com/company/aurifertax/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white/10 hover:bg-orange-500/20 border border-white/20 hover:border-orange-400/50 rounded-lg transition-all duration-300 text-white font-medium"
                                >
                                    LinkedIn
                                </a>
                                <a 
                                    href="https://www.youtube.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-400/50 rounded-lg transition-all duration-300 text-white font-medium"
                                >
                                    YouTube
                                </a>
                            </div>

                            <h3 className="text-2xl font-bold mb-6 text-orange-400">Stay up to date</h3>
                            <p className="text-white/70 mb-4">Sign up for our newsletter</p>
                            
                            <div className="flex gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-400/50 focus:ring-1 focus:ring-orange-400/50"
                                />
                                <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
                                    Send
                                </button>
                            </div>

                            {/* Quick Links */}
                            <div className="mt-12 flex flex-wrap gap-4">
                                <a 
                                    href="https://aurifer.tax/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-white text-[#162236] font-bold rounded-lg hover:bg-white/90 transition-all duration-300 shadow-lg"
                                >
                                    Visit Website
                                </a>
                                <a 
                                    href="/dashboard" 
                                    className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                                >
                                    Client Portal
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="border-t border-white/10 pt-8 text-center"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-white/60 text-sm">
                                © {new Date().getFullYear()} Aurifer Tax ME. All rights reserved.
                            </p>
                            <div className="flex gap-6 text-sm text-white/60">
                                <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
                                <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
                                <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
