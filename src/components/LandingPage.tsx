import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Check,
    ArrowRight,
    Sparkles,
    Shield,
    Zap,
    BookOpen,
    GraduationCap,
    Microscope,
    ScrollText,
    Menu,
    X
} from 'lucide-react';
import connectedWorldBro from '../assets/Connected world-bro.svg';
import mailSentRafiki from '../assets/Mail sent-rafiki.svg';
import examsBro from '../assets/Exams-bro.svg';
import computerLoginBro from '../assets/Computer login-bro.svg';
import onlineWorldBro from '../assets/Online world-bro.svg';
import mobileMarketingBro from '../assets/Mobile Marketing-bro.svg';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.replaceState(null, '', `/landing#${id}`);
            setActiveSection(id);
        }
        setMobileMenuOpen(false);
    };

    // On every page load/refresh: always start from the top
    useEffect(() => {
        window.history.scrollRestoration = 'manual';
        window.history.replaceState(null, '', '/landing');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        const sections = ['hero', 'how-it-works', 'templates', 'features'];
        const observers: IntersectionObserver[] = [];

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const hash = id === 'hero' ? '' : `#${id}`;
                            window.history.replaceState(null, '', `/landing${hash}`);
                            setActiveSection(id === 'hero' ? '' : id);
                        }
                    });
                },
                { threshold: 0.4 }
            );
            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="font-sans text-slate-900 bg-white min-h-screen">

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-11 h-11 bg-white border-[3px] border-[#159e8a] rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                            <span className="text-[#159e8a] text-[26px] font-black font-sans leading-none tracking-tighter" style={{ marginTop: '1px', marginRight: '1px', marginBottom: '1px' }}>A</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-800">Auto-Flow</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {[{ id: 'how-it-works', label: 'How It Works' }, { id: 'templates', label: 'Workflows' }, { id: 'features', label: 'Features' }].map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => scrollToSection(id)}
                                className="relative text-sm font-medium text-slate-600 hover:text-[#159e8a] transition-colors group pb-0.5"
                            >
                                {label}
                                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#159e8a] transition-all duration-300 ${activeSection === id ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`} />
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-[#159e8a] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-[#159e8a]/25 hover:bg-[#128a78] hover:shadow-[#159e8a]/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        >
                            Get Started <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
                        >
                            <div className="px-6 py-4 flex flex-col gap-4">
                                <button onClick={() => scrollToSection('templates')} className="text-sm font-medium text-slate-600 py-2 text-left">Workflows</button>
                                <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 py-2 text-left">Features</button>
                                <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-600 py-2 text-left">How It Works</button>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <button onClick={() => navigate('/login')} className="text-sm font-semibold text-[#159e8a] py-2 text-left">Get Started</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section id="hero" className="pt-32 pb-20 px-6 relative">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#159e8a]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4"></div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#159e8a]/10 text-[#159e8a] text-xs font-semibold mb-6">
                            <Sparkles size={14} /> AI-Powered Analysis
                        </motion.div>
                        <motion.h1 variants={fadeInUp} className="text-5xl lg:text-[5.5rem] font-bold text-slate-900 leading-[1.05] mb-8 tracking-tight">
                            Smart<br></br><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#159e8a] to-blue-600">Seamless Supervision.</span>
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                            A unified platform bridging advanced AI document analysis with lifecycle management. Effortlessly review student work, perform quality checks, and track milestones.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-[#159e8a] text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-[#159e8a]/30 hover:bg-[#128a78] hover:shadow-[#159e8a]/50 hover:-translate-y-1 transition-all duration-300"
                            >
                                Start Supervising Free
                            </button>
                            <button className="bg-white text-slate-700 font-semibold text-lg px-8 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300" onClick={() => scrollToSection('features')}>
                                Explore Platform
                            </button>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-8 text-sm font-medium text-slate-500">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><Check size={12} className="text-green-600" /></div>
                                No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><Check size={12} className="text-green-600" /></div>
                                Forever plan
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative lg:h-[650px] flex items-center justify-center w-full"
                    >
                        {/* 3D Abstract Decorators (Optional - leaving empty for clean look as requested) */}

                        <div className="relative w-[90%] max-w-[480px] mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(21,158,138,0.2)] border-2 border-[#159e8a] p-8 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 z-10">
                            {/* Document Mockup */}
                            {/* Document Mockup Content */}
                            <div className="mb-6 border-b border-slate-800 pb-4">
                                <h3 className="font-bold text-black text-center text-lg">" Where Excellence Meets Automation. "</h3>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-xs text-[#159e8a] font-medium bg-slate-50 p-2 rounded w-fit">Track Every Milestone....</p>
                                <p className="text-xs text-[#159e8a] font-medium bg-slate-50 p-2 rounded w-fit">Initiate Your Work-Space.....</p>
                                <p className="text-xs text-[#159e8a] font-medium bg-slate-50 p-2 rounded w-fit">Streamline. Simplify. Succeed......</p>
                                <p></p>

                            </div>

                            {/* Lotus Meditation Graphic */}
                            {/* Connected World Graphic */}
                            <div className="w-full h-72 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-xl mb-8 flex flex-col items-center justify-center border border-slate-200 shadow-inner relative overflow-hidden group p-2">
                                <div className="relative z-10 w-full h-full flex items-center justify-center">
                                    <img src={connectedWorldBro} alt="Connected World" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-10" />
                                </div>
                            </div>

                            <div className="w-full h-4 bg-slate-50 rounded mb-2"></div>
                            <div className="w-4/5 h-4 bg-slate-50 rounded mb-2"></div>

                            {/* Floating Processing Card aligned inside */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="absolute bottom-6 left-6 right-6 bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center gap-4 z-20"
                            >
                                <div className="w-12 h-12 rounded-xl  flex items-center justify-center text-[#159e8a] relative">
                                    <div className="absolute inset-[2px] border-[3px] border-[#159e8a]/20 rounded-full"></div>
                                    <div className="absolute inset-[2px] border-[3px] border-transparent border-t-[#159e8a] rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                                    <span className="text-xs font-bold z-10">85%</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Analyzing Document</div>
                                    <div className="text-xs text-slate-500">Quality check in progress...</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Floating Mail Sent Graphic - Left Side */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0, y: [-15, 15, -15] }}
                            transition={{ opacity: { duration: 0.8, delay: 0.6 }, x: { duration: 0.8, delay: 0.6 }, y: { repeat: Infinity, duration: 7, ease: "easeInOut" } }}
                            className="absolute z-0 hidden lg:block left-[-280px] top-[-5%] w-[280px] opacity-90 pointer-events-none"
                        >
                            <img src={mailSentRafiki} alt="Mail Sent Illustration" className="w-full h-auto drop-shadow-2xl" />
                        </motion.div>
                    </motion.div> {/* End of Desktop Right Side Container */}
                </div> {/* End of max-w-[1400px] grid container */}
            </section >

            {/* How It Works Section */}
            < section id="how-it-works" className="py-24 bg-white scroll-mt-24" >
                <div className="max-w-[1400px] mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Works</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            Streamline university supervision in four simple steps. Combine intelligent quality checks with granular progress tracking.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                step: '01', title: 'Track Milestones', color: 'bg-blue-500',
                                desc: 'Set up timelines and track granular progress through an integrated Project Management System.',
                                icon: <ScrollText size={22} className="text-white" />,
                            },
                            {
                                step: '02', title: 'Submit Student Work', color: 'bg-purple-500',
                                desc: 'Students easily upload their documents, reports, and project deliverables for review.',
                                icon: <ArrowRight size={22} className="text-white rotate-[-90deg]" />,
                            },
                            {
                                step: '03', title: 'AI Document Analysis', color: 'bg-[#159e8a]',
                                desc: 'Advanced AI performs intelligent quality checks to ensure academic rigor and standards are met.',
                                icon: <Sparkles size={22} className="text-white" />,
                            },
                            {
                                step: '04', title: 'Review & Approve', color: 'bg-orange-500',
                                desc: 'Supervisors provide feedback, effortlessly review submissions, and ensure timely delivery.',
                                icon: <FileText size={22} className="text-white" />,
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.7, delay: idx * 0.15, ease: "easeOut" }}
                                whileHover={{ y: -6, boxShadow: '0 16px 40px -10px rgba(21,158,138,0.35)' }}
                                className="relative bg-white border border-slate-200 group-hover:border-[#159e8a] rounded-2xl pt-10 pb-7 px-7 group cursor-default shadow-sm transition-all duration-300 min-h-[260px] flex flex-col group hover:border-[#159e8a]"
                            >
                                {/* Step badge — floats above top edge */}
                                <div className={`absolute -top-4 right-5 ${item.color} text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md`}>
                                    {item.step}
                                </div>

                                {/* Icon */}
                                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-5 shadow-md transition-transform duration-300 group-hover:scale-110`}>
                                    {item.icon}
                                </div>

                                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Templates Showcase */}
            < section id="templates" className="py-24 px-6 scroll-mt-24" >
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.4 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Super <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Workflows</span></h2>
                            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                                Specialized academic workflows designed for every stage of supervision and project management.
                            </p>
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.4 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-[#159e8a] font-semibold flex items-center gap-2 hover:gap-3 transition-all"
                        >

                        </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Thesis & Dissertation", icon: <GraduationCap size={24} />, color: "from-blue-600 to-indigo-600", shadow: "shadow-blue-500/20", image: examsBro },
                            { title: "Project Reports", icon: <FileText size={24} />, color: "from-emerald-500 to-teal-700", shadow: "shadow-emerald-500/20", image: computerLoginBro },
                            { title: "Research Proposals", icon: <Microscope size={24} />, color: "from-orange-500 to-red-600", shadow: "shadow-orange-500/20", image: onlineWorldBro },
                            { title: "Daily Digest", icon: <BookOpen size={24} />, color: "from-purple-600 to-fuchsia-600", shadow: "shadow-purple-500/20", image: mobileMarketingBro }
                        ].map((template, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.7, delay: idx * 0.15, ease: "easeOut" }}
                                className="group cursor-pointer"
                            >
                                <div className={`aspect-[4/5] bg-gradient-to-br ${template.color} rounded-2xl mb-4 relative overflow-hidden shadow-lg hover:shadow-2xl hover:${template.shadow} transition-all duration-300 transform group-hover:-translate-y-2`}>
                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 group-hover:bg-white/20 transition-all duration-500"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -translate-x-1/3 translate-y-1/3"></div>

                                    {/* SVG Image */}
                                    <div className="absolute inset-0 p-6 flex items-start justify-center pt-12 pb-24 z-10 pointer-events-none opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                                        <img src={template.image} alt={template.title} className="w-full h-full object-contain filter drop-shadow-md" />
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/80 to-transparent flex flex-col justify-end p-6 z-20 box-border pt-16">
                                        <div className="text-white transform transition-transform duration-300">
                                            <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/30 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                                                {template.icon}
                                            </div>
                                            <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-white transition-colors">{template.title}</h3>

                                            <div className="flex items-center gap-2 text-white/90 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                <span>Explore workflow</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Features Grid */}
            < section id="features" className="py-24 bg-white scroll-mt-24" >
                <div className="max-w-[1400px] mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.4 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Features</span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Everything you need for seamless university supervision. Auto-Flow combines intelligent quality checks with robust lifecycle management.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Unified Submissions',
                                desc: 'Support for PDF, DOCX, TXT uploads for student work and project deliverables in one place.',
                                icon: <ArrowRight size={22} className="rotate-[-90deg]" />,
                                bg: 'bg-blue-50', iconColor: 'text-blue-500',
                            },
                            {
                                title: 'Advanced AI Analysis',
                                desc: 'Intelligent quality checks evaluate structure, content, and academic rigor instantly.',
                                icon: <Sparkles size={22} />,
                                bg: 'bg-purple-50', iconColor: 'text-purple-500',
                            },
                            {
                                title: 'Lifecycle Management',
                                desc: 'End-to-end tracking of project milestones, from initial proposal to final presentation.',
                                icon: <Zap size={22} />,
                                bg: 'bg-pink-50', iconColor: 'text-pink-500',
                            },
                            {
                                title: 'Granular Progress Tracking',
                                desc: 'Visual dashboards to monitor student progress and ensure timely delivery of all assignments.',
                                icon: <ScrollText size={22} />,
                                bg: 'bg-orange-50', iconColor: 'text-orange-500',
                            },
                            {
                                title: 'Effortless Review',
                                desc: 'Compare revisions side-by-side, leave annotations, and provide actionable feedback easily.',
                                icon: <GraduationCap size={22} />,
                                bg: 'bg-indigo-50', iconColor: 'text-indigo-500',
                            },
                            {
                                title: 'Seamless Collaboration',
                                desc: 'Integrated communication tools bridge the gap between students and their academic supervisors.',
                                icon: <FileText size={22} />,
                                bg: 'bg-[#159e8a]/10', iconColor: 'text-[#159e8a]',
                            },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.2 }}
                                transition={{ duration: 0.7, delay: idx * 0.1, ease: "easeOut" }}
                                whileHover={{ y: -6, boxShadow: '0 16px 40px -10px rgba(21,158,138,0.30)' }}
                                className="bg-white border border-slate-100 rounded-2xl p-7 group cursor-default shadow-sm transition-all duration-300 hover:border-[#159e8a]"
                            >
                                <div className={`w-11 h-11 ${feature.bg} ${feature.iconColor} rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#159e8a]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                        {/* Brand Column */}
                        <div className="md:col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-white border-[2.5px] border-[#159e8a] rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                                    <span className="text-[#159e8a] text-xl font-black font-sans leading-none tracking-tighter" style={{ marginTop: '1px' }}>A</span>
                                </div>
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">Auto-Flow</span>
                            </div>
                            <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm">
                                Bridging advanced AI document analysis with lifecycle management for university supervision. Streamline your entire academic workflow.
                            </p>
                            <div className="flex gap-4 mb-8">
                                {/* Social Icons */}
                                <a href="#!" onClick={(e) => e.preventDefault()} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#159e8a] hover:text-white hover:border-[#159e8a] hover:scale-110 transition-all duration-300 shadow-sm">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                </a>
                                <a href="#!" onClick={(e) => e.preventDefault()} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#159e8a] hover:text-white hover:border-[#159e8a] hover:scale-110 transition-all duration-300 shadow-sm">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                                <a href="#!" onClick={(e) => e.preventDefault()} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#159e8a] hover:text-white hover:border-[#159e8a] hover:scale-110 transition-all duration-300 shadow-sm">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                </a>
                                <a href="#!" onClick={(e) => e.preventDefault()} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#159e8a] hover:text-white hover:border-[#159e8a] hover:scale-110 transition-all duration-300 shadow-sm">
                                    <span className="sr-only">Google</span>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
                                </a>
                                <a href="#!" onClick={(e) => e.preventDefault()} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-[#159e8a] hover:text-white hover:border-[#159e8a] hover:scale-110 transition-all duration-300 shadow-sm">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6 text-lg tracking-tight">Product</h4>
                            <ul className="space-y-4">
                                <li><a href="#features" className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Features</a></li>
                                <li><a href="#templates" className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Workflows</a></li>
                                <li><a href="#how-it-works" className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">How it Works</a></li>
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-6 text-lg tracking-tight">Resources</h4>
                            <ul className="space-y-4">
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Blog</a></li>
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Help Center</a></li>
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Community</a></li>
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">API Documentation</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-6 text-lg tracking-tight">Legal</h4>
                            <ul className="space-y-4">
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Privacy Policy</a></li>
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Terms of Service</a></li>
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Cookie Policy</a></li>
                                <li><a href="#!" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-[#159e8a] hover:translate-x-1 inline-block transition-all duration-300 font-medium">Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500 font-medium">© 2025 AUTO_FLOW. All rights reserved.</p>
                        {/* <div className="text-sm text-slate-500 font-medium flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                            Made with <span className="text-red-500 animate-pulse">❤️</span> for universities everywhere.
                        </div> */}
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default LandingPage;
