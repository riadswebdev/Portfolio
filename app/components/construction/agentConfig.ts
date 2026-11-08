import { AgentId, AgentInfo, ConstructionPhase } from "./types";

export const AGENTS: Record<AgentId, AgentInfo> = {
  "ui-designer": {
    id: "ui-designer",
    name: "UI Designer",
    role: "UI / UX Architect",
    color: "#a855f7", // Vibrant Purple
    glowColor: "rgba(168, 85, 247, 0.55)",
    badgeBg: "rgba(30, 16, 50, 0.85)",
    borderColor: "rgba(168, 85, 247, 0.5)",
    avatarIcon: "🎨",
    initials: "UI",
  },
  "frontend-dev": {
    id: "frontend-dev",
    name: "Frontend Dev",
    role: "React / Next.js Specialist",
    color: "#06b6d4", // Electric Cyan
    glowColor: "rgba(6, 182, 212, 0.55)",
    badgeBg: "rgba(8, 30, 45, 0.85)",
    borderColor: "rgba(6, 182, 212, 0.5)",
    avatarIcon: "⚡",
    initials: "FE",
  },
  "motion-designer": {
    id: "motion-designer",
    name: "Motion Designer",
    role: "Physics & Interaction",
    color: "#f59e0b", // Amber / Gold
    glowColor: "rgba(245, 158, 11, 0.55)",
    badgeBg: "rgba(40, 28, 8, 0.85)",
    borderColor: "rgba(245, 158, 11, 0.5)",
    avatarIcon: "✨",
    initials: "MO",
  },
  "creative-director": {
    id: "creative-director",
    name: "Creative Director",
    role: "Design System & QA",
    color: "#f43f5e", // Rose / Red-Pink
    glowColor: "rgba(244, 63, 94, 0.55)",
    badgeBg: "rgba(42, 12, 22, 0.85)",
    borderColor: "rgba(244, 63, 94, 0.5)",
    avatarIcon: "👑",
    initials: "CD",
  },
};

export const AGENT_LIST: AgentId[] = [
  "ui-designer",
  "frontend-dev",
  "motion-designer",
  "creative-director",
];

export const PHASES: ConstructionPhase[] = [
  // ── Phase 1: Hero Typography & Layout Framing ──
  {
    id: "hero-intro",
    name: "Hero Architecture",
    scrollStart: 0.0,
    scrollEnd: 0.12,
    targetId: "hero-headline",
    targetName: "Hero Header & Badge",
    highlightBounds: true,
    agents: {
      "ui-designer": {
        targetId: "hero-headline",
        offsetX: 0.25,
        offsetY: 0.35,
        action: "Snapping Typography: 72px / Bold",
        isClicking: true,
      },
      "frontend-dev": {
        targetId: "hero-badge",
        offsetX: 0.5,
        offsetY: 0.5,
        action: "Mounting Status Badge",
        isClicking: false,
      },
      "motion-designer": {
        targetId: "hero-headline",
        offsetX: 0.75,
        offsetY: 0.85,
        action: "Calibrating Gradient Easing",
        isClicking: false,
      },
      "creative-director": {
        targetId: "hero-headline",
        offsetX: 0.95,
        offsetY: -0.1,
        action: "Grid Alignment: 12-col Spec",
        isClicking: false,
      },
    },
  },

  // ── Phase 2: Hero Interactive Card & CTAs ──
  {
    id: "hero-card-assembly",
    name: "Hero Card & CTA Assembly",
    scrollStart: 0.12,
    scrollEnd: 0.24,
    targetId: "hero-card",
    targetName: "Developer.ts Interactive Card",
    highlightBounds: true,
    approvalBadge: "Hero Verified ✓",
    agents: {
      "ui-designer": {
        targetId: "hero-cta",
        offsetX: 0.3,
        offsetY: 0.5,
        action: "Aligning Pill Radius: 16px",
        isClicking: false,
      },
      "frontend-dev": {
        targetId: "hero-card",
        offsetX: 0.55,
        offsetY: 0.55,
        action: "Injecting Developer.ts AST Tokens",
        isClicking: true,
      },
      "motion-designer": {
        targetId: "hero-cta",
        offsetX: 0.7,
        offsetY: 0.45,
        action: "Testing Button Glow Pulse",
        isClicking: true,
      },
      "creative-director": {
        targetId: "hero-card",
        offsetX: 0.85,
        offsetY: 0.15,
        action: "QA Stamp: Glassmorphism Approved",
        isClicking: false,
      },
    },
  },

  // ── Phase 3: Milestones & Metric Telemetry ──
  {
    id: "milestones-scaffold",
    name: "Milestone Metrics Grid",
    scrollStart: 0.24,
    scrollEnd: 0.42,
    targetId: "milestones-grid",
    targetName: "Key Milestones & Stats",
    highlightBounds: true,
    agents: {
      "ui-designer": {
        targetId: "milestones-grid",
        offsetX: 0.15,
        offsetY: 0.35,
        action: "Scaffolding Responsive Grid",
        isClicking: false,
      },
      "frontend-dev": {
        targetId: "milestones-grid",
        offsetX: 0.38,
        offsetY: 0.45,
        action: "Binding Metrics Data Feed",
        isClicking: true,
      },
      "motion-designer": {
        targetId: "milestones-grid",
        offsetX: 0.65,
        offsetY: 0.4,
        action: "Kinetic Counter Reveal (60fps)",
        isClicking: true,
      },
      "creative-director": {
        targetId: "milestones-grid",
        offsetX: 0.88,
        offsetY: 0.3,
        action: "Viewport Scalability: 100%",
        isClicking: false,
      },
    },
  },

  // ── Phase 4: Capabilities & Tech Stack ──
  {
    id: "capabilities-assembly",
    name: "Tech Capabilities Matrix",
    scrollStart: 0.42,
    scrollEnd: 0.62,
    targetId: "capabilities-grid",
    targetName: "Technical Stack Cards",
    highlightBounds: true,
    approvalBadge: "Architecture Certified ✓",
    agents: {
      "ui-designer": {
        targetId: "capabilities-grid",
        offsetX: 0.18,
        offsetY: 0.45,
        action: "Styling & UI Micro-Gradients",
        isClicking: false,
      },
      "frontend-dev": {
        targetId: "capabilities-grid",
        offsetX: 0.82,
        offsetY: 0.45,
        action: "Wiring Node.js & REST API Contracts",
        isClicking: true,
      },
      "motion-designer": {
        targetId: "capabilities-grid",
        offsetX: 0.42,
        offsetY: 0.45,
        action: "HTML5 Canvas Raf Sync Loop",
        isClicking: true,
      },
      "creative-director": {
        targetId: "capabilities-grid",
        offsetX: 0.6,
        offsetY: 0.2,
        action: "Full-Stack System Verified",
        isClicking: false,
      },
    },
  },

  // ── Phase 5: Featured Projects Live Repos ──
  {
    id: "projects-assembly",
    name: "Featured Projects Stream",
    scrollStart: 0.62,
    scrollEnd: 0.78,
    targetId: "projects-grid",
    targetName: "Live GitHub Projects",
    highlightBounds: true,
    agents: {
      "ui-designer": {
        targetId: "projects-grid",
        offsetX: 0.25,
        offsetY: 0.3,
        action: "Card Elevation & Aspect Ratio",
        isClicking: false,
      },
      "frontend-dev": {
        targetId: "projects-grid",
        offsetX: 0.5,
        offsetY: 0.5,
        action: "Hydrating GitHub Live Repos",
        isClicking: true,
      },
      "motion-designer": {
        targetId: "projects-grid",
        offsetX: 0.75,
        offsetY: 0.4,
        action: "3D Perspective Card Physics",
        isClicking: false,
      },
      "creative-director": {
        targetId: "projects-grid",
        offsetX: 0.9,
        offsetY: 0.15,
        action: "Open Source QA Verified",
        isClicking: false,
      },
    },
  },

  // ── Phase 6: Engineering Workflow ──
  {
    id: "workflow-assembly",
    name: "AI Workflow Pipeline",
    scrollStart: 0.78,
    scrollEnd: 0.9,
    targetId: "workflow-grid",
    targetName: "4-Step Engineering Process",
    highlightBounds: true,
    approvalBadge: "Pipeline Validated 100% ✓",
    agents: {
      "ui-designer": {
        targetId: "workflow-grid",
        offsetX: 0.15,
        offsetY: 0.4,
        action: "Step 01: Component Boundary Specs",
        isClicking: false,
      },
      "frontend-dev": {
        targetId: "workflow-grid",
        offsetX: 0.4,
        offsetY: 0.4,
        action: "Step 02: AI-Augmented Logic",
        isClicking: true,
      },
      "motion-designer": {
        targetId: "workflow-grid",
        offsetX: 0.65,
        offsetY: 0.4,
        action: "Step 03: Performance Audit",
        isClicking: false,
      },
      "creative-director": {
        targetId: "workflow-grid",
        offsetX: 0.88,
        offsetY: 0.4,
        action: "Step 04: Production Release",
        isClicking: true,
      },
    },
  },

  // ── Phase 7: Contact Final Assembly & Launch Celebration ──
  {
    id: "contact-assembly",
    name: "Final Assembly & Launch",
    scrollStart: 0.9,
    scrollEnd: 1.0,
    targetId: "contact-card",
    targetName: "Production Launch & Contact CTA",
    highlightBounds: true,
    approvalBadge: "Ready to Deploy 🚀",
    agents: {
      "ui-designer": {
        targetId: "contact-card",
        offsetX: 0.28,
        offsetY: 0.6,
        action: "Interface Completed ✨",
        isClicking: true,
      },
      "frontend-dev": {
        targetId: "contact-card",
        offsetX: 0.45,
        offsetY: 0.62,
        action: "Production Build Ready ⚡",
        isClicking: true,
      },
      "motion-designer": {
        targetId: "contact-card",
        offsetX: 0.62,
        offsetY: 0.6,
        action: "Fluid Transitions 60fps 💫",
        isClicking: true,
      },
      "creative-director": {
        targetId: "contact-card",
        offsetX: 0.78,
        offsetY: 0.58,
        action: "Portfolio Approved 100% 👑",
        isClicking: true,
      },
    },
  },
];

