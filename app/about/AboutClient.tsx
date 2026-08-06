"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutClient() {
  const highlights = [
    { text: "React & Next.js Applications" },
    { text: "Database Design & Optimization" },
    { text: "Responsive & Accessible UI" },
    { text: "Cloud Deployment (AWS, Vercel)" },
    { text: "Performance Optimization" },
    { text: "Global State Management (Redux)" },
    { text: "Secure Authentication (Firebase, BetterAuth)" },
    { text: "Modern CSS Frameworks (Tailwind, DaisyUI)" },
    { text: "Server-side Logic (Node.js, Express.js)" },
    { text: "Version Control (Git & GitHub)" },
  ];

  const stats = [
    {
      number: "20+",
      label: "Projects",
      icon: (
        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      number: "10+",
      label: "Clients",
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      number: "5+",
      label: "Certificates",
      icon: (
        <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 flex flex-col justify-between overflow-hidden">

      {/* ── Background Video — color graded to match portfolio aesthetic ── */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-none -z-20 overflow-hidden"
      
      >
        <video
          src="https://res.cloudinary.com/djgg1xzaj/video/upload/v1786008084/clideo_editor_feb586d352f84e049a544030d0661b82_ydzmp6.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute top-1/2 left-1/2 w-[100vw] h-[100vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover"
        />
      </div>

      {/* Navigation */}
      <Navbar activeSection="about" />

      {/* Main Section */}
      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-16 flex-1">

        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          <div className="inline-block px-4 py-1 rounded-full border border-zinc-700/60 text-xs font-semibold text-zinc-300 tracking-wide backdrop-blur-md" style={{ background: "rgba(4, 6, 12, 0.55)" }}>
            About Me
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Get to know <span className="text-cyan-400">who I am</span>
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base font-light leading-relaxed">
            A passionate developer dedicated to turning complex ideas into elegant, high-performance digital experiences.
          </p>
        </motion.div>

        {/* Bio & Image Grid Section */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* Left Frame Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative group w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-700/60 p-2 shadow-2xl shadow-cyan-950/30 backdrop-blur-sm" style={{ background: "rgba(4, 6, 12, 0.45)" }}>
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src="/riad.png"
                  alt="Md. Riad Shekh"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Right Bio & Skills Pills */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2">
              <span className="text-xs font-medium text-cyan-400 tracking-wider">Professional Bio</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Full Stack Web Developer
              </h2>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                React / Next.js Specialist
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light pt-1">
                I&apos;m <span className="text-zinc-100 font-semibold">Md. Riad Shekh</span> — a Full Stack Web Developer focused on scalable, modern and high-performance web applications.
              </p>
            </div>

            {/* Grid of Highlight Pills */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {highlights.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-full border border-zinc-700/50 hover:border-cyan-500/40 transition-colors group backdrop-blur-sm"
                  style={{ background: "rgba(4, 6, 12, 0.48)" }}
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-300 group-hover:text-white font-medium truncate">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/contact"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Let&apos;s Work Together
              </a>
              <a
                href="/Md%20Riad%20Shekh%20Final%20Resume.pdf"
                target="_blank"
                download="Md Riad Shekh Final Resume.pdf"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl border border-zinc-700/60 hover:border-cyan-500/50 text-zinc-200 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-lg group cursor-pointer backdrop-blur-sm"
                style={{ background: "rgba(4, 6, 12, 0.50)" }}
              >
                <svg className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Resume</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* 3 Stats Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-2xl border border-zinc-700/60 hover:border-zinc-600/80 transition-colors text-center space-y-2 flex flex-col items-center justify-center shadow-lg backdrop-blur-md"
              style={{ background: "rgba(4, 6, 12, 0.52)" }}
            >
              <div className="p-2.5 rounded-xl border border-zinc-700/50 mb-1" style={{ background: "rgba(10, 14, 22, 0.70)" }}>
                {stat.icon}
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stat.number}</p>
              <p className="text-xs text-zinc-100 font-medium tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>


        {/* Paragraphs Description */}
        <div className="space-y-5 text-white text-xs sm:text-sm leading-relaxed font-light border-t border-zinc-700/30 pt-10">
          <p>
            Hi, I&apos;m <span className="font-bold text-white">Md. Riad Shekh</span>, a passionate <span className="text-cyan-400 font-semibold">Full Stack Web Developer</span> with a strong interest in building modern, responsive, and user-friendly web applications.
          </p>
          <p>
            My programming journey began with learning HTML and CSS out of curiosity. As I continued exploring web development, I mastered JavaScript and React, and later expanded my skills to Next.js, Node.js, Express.js, MongoDB, and modern development tools. Every project I build helps me improve my problem-solving skills and understand real-world software development practices.
          </p>
          <p>
            I especially enjoy creating full-stack applications with clean UI, smooth user experiences, secure authentication, and scalable backend architecture. Turning ideas into functional products is the part of development I enjoy the most.
          </p>
          <p>
            Outside of programming, I enjoy learning new technologies, exploring modern UI/UX design trends, editing videos, and spending time improving my creative skills. I also enjoy listening to music and continuously challenging myself with new projects.
          </p>
          <p>
            I believe in continuous learning, writing clean code, and building solutions that make people&apos;s lives easier. My goal is to become a professional software engineer delivering impactful solutions globally.
          </p>
        </div>

        {/* Bottom Core Stack Card */}
        <div className="p-6 rounded-2xl border border-zinc-700/60 text-center space-y-2 shadow-lg backdrop-blur-md" style={{ background: "rgba(4, 6, 12, 0.52)" }}>
          <h4 className="text-sm font-bold text-cyan-400 tracking-wide uppercase">Core Stack:</h4>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium">
            React, Next.js, Node.js, MongoDB, Tailwind CSS, Firebase, Docker, Vercel
          </p>
        </div>

      </main>

      {/* Compact Footer */}
      <Footer />
    </div>
  );
}
