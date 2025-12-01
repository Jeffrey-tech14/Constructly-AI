// src/components/sections/HowItWorks.tsx
import React from "react";
import { motion } from "framer-motion";
import {
    UploadCloud,
    BarChart3,
    Calculator,
    FileText,
    ArrowRight,
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
    `}</style>
);

// --- TYPESCRIPT INTERFACE for Type Safety ---
interface Step {
    id: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
    baseColor: string;
    topColor: string;
}

export default function HowItWorks() {
    const steps: Step[] = [
        {
            id: "01",
            icon: <UploadCloud className="h-8 w-8 text-white" />,
            title: "UPLOAD PLANS",
            desc: "Upload your construction plans in various formats including DWG, PDF, and image files to automatically begin the extraction process.",
            baseColor: "#57d3b0",
            topColor: "#32c091",
        },
        {
            id: "02",
            icon: <BarChart3 className="h-8 w-8 text-white" />,
            title: "AI ANALYSIS",
            desc: "Our advanced AI algorithms analyze materials, dimensions, and structural requirements with 99.9% precision.",
            baseColor: "#38a2e7",
            topColor: "#007bff",
        },
        {
            id: "03",
            icon: <Calculator className="h-8 w-8 text-white" />,
            title: "AUTOMATED CALCULATIONS",
            desc: "Get precise quantity takeoffs and engineering cost estimates with detailed breakdowns generated instantly in the cloud.",
            baseColor: "#1a73e8",
            topColor: "#0f5ac9",
        },
        {
            id: "04",
            icon: <FileText className="h-8 w-8 text-white" />,
            title: "GENERATE QUOTES",
            desc: "Create professional, branded quotes ready to send to clients immediately. Export to PDF, Excel, or integrate via API.",
            baseColor: "#0c43a3",
            topColor: "#07327a",
        }
    ];

    // FIXED: renamed from itemVariants to variants (common pattern) + ensured no underline error
    const variants = {
        hidden: { opacity: 0, y: 50 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.15 + 0.3,
                duration: 0.6,
                ease: "easeOut",
            },
        }),
    };

    return (
        <>
        <GlobalStyles />
        <section 
            id="how-it-works" 
            className="bg-[#F0F7FA] font-inter text-[#1a1a1a] py-24 overflow-hidden"
        >
            <div className="max-w-[1240px] mx-auto px-6">
                
                {/* --- SECTION HEADING --- */}
                <div className="mb-20 text-center">
                    <h2 className="text-4xl font-extrabold text-[#001021] mb-4">
                        J-Tech AI Workflow: Automated Estimation
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Effortlessly transform your construction plans into precise cost estimates and client-ready quotes with our intelligent 4-step process.
                    </p>
                </div>

                {/* --- WORKFLOW GRID & SVG LINES --- */}
                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-24 md:gap-y-40">

                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden lg:block" viewBox="0 0 1240 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                        {steps.map((step, i) => {
                            if (i < steps.length - 1) {
                                const isEven = i % 2 === 0;
                                const x1 = 155 + i * 310;
                                const y1 = isEven ? 200 : 380;
                                const x2 = 155 + (i + 1) * 310;
                                const y2 = isEven ? 380 : 200;

                                return (
                                    <motion.path
                                        key={`line-${i}`}
                                        d={`M ${x1} ${y1} C ${x1 + 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`}
                                        stroke={`url(#lineGradient${i})`}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        fill="none"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{
                                            pathLength: 1,
                                            opacity: 1,
                                            transition: {
                                                delay: i * 0.15 + 0.8,
                                                duration: 0.9,
                                                ease: "easeInOut",
                                            },
                                        }}
                                        viewport={{ once: true, amount: 0.5 }}
                                    />
                                );
                            }
                            return null;
                        })}

                        {steps.map((step, i) => (
                            <defs key={`def-${i}`}>
                                <linearGradient id={`lineGradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={step.baseColor} />
                                    <stop offset="100%" stopColor={steps[i + 1]?.baseColor || step.baseColor} />
                                </linearGradient>
                            </defs>
                        ))}
                    </svg>

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={variants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.7 }}
                            className={`flex flex-col items-center justify-start text-center relative z-20 ${
                                i % 4 === 1 || i % 4 === 3 ? "lg:mt-36" : "lg:mt-0" 
                            }`}
                        >

                            <div className="mb-4 md:mb-8 max-w-[240px] text-center px-4 md:px-0 lg:hidden">
                                <h3 className="text-sm font-bold text-[#001021] uppercase tracking-wide mb-1">
                                    {step.title}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>

                            {i % 2 !== 0 && (
                                <div className="hidden lg:block mb-8 max-w-[200px] text-center px-4 md:px-0">
                                    <h3 className="text-sm font-bold text-[#001021] uppercase tracking-wide mb-1">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        {step.desc}
                                    </p>
                                </div>
                            )}

                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <div
                                    className="absolute w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-xl"
                                    style={{
                                        background: `linear-gradient(to bottom, ${step.topColor}, ${step.baseColor})`,
                                        filter: `drop-shadow(0px 6px 10px ${step.baseColor}50)`
                                    }}
                                >
                                    {step.icon}
                                </div>

                                <span
                                    className="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white z-30"
                                    style={{
                                        backgroundColor: step.baseColor,
                                        top: "calc(50% - 12px)",
                                        left: "calc(50% - 60px)",
                                        boxShadow: `0 2px 4px ${step.baseColor}70`
                                    }}
                                >
                                    {step.id}
                                </span>
                            </div>

                            {i % 2 === 0 && (
                                <div className="hidden lg:block mt-8 max-w-[200px] text-center px-4 md:px-0">
                                    <h3 className="text-sm font-bold text-[#001021] uppercase tracking-wide mb-1">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        {step.desc}
                                    </p>
                                </div>
                            )}

                        </motion.div>
                    ))}
                </div>

                {/* CTA REMOVED */}

            </div>
        </section>
        </>
    );
}
