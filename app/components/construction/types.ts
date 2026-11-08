export type AgentId =
  | "ui-designer"
  | "frontend-dev"
  | "motion-designer"
  | "creative-director";

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  color: string;
  glowColor: string;
  badgeBg: string;
  borderColor: string;
  avatarIcon: string;
  initials: string;
}

export interface AgentWaypoint {
  targetId: string;
  /** Relative offset inside target bounds: [0..1, 0..1], or normalized screen [x, y] */
  offsetX: number;
  offsetY: number;
  action: string;
  isClicking?: boolean;
  scale?: number;
}

export interface ConstructionPhase {
  id: string;
  name: string;
  scrollStart: number;
  scrollEnd: number;
  targetId: string;
  targetName: string;
  agents: Record<AgentId, AgentWaypoint>;
  highlightBounds?: boolean;
  approvalBadge?: string;
}

