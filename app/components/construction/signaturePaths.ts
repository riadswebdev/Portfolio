export interface SignaturePoint {
  x: number;
  y: number;
}

export interface SignatureStroke {
  label: string;
  points: SignaturePoint[];
}

/**
 * Twenty-four independent pointer paths form the letters R-I-A-D and a star.
 * These are drawing trajectories, not a pre-rendered wordmark.
 */
export const SIGNATURE_STROKES: SignatureStroke[] = [
  // R — stem, top, bowl and leg
  { label: "R stem", points: [{ x: 12, y: 12 }, { x: 12, y: 72 }] },
  { label: "R top", points: [{ x: 12, y: 12 }, { x: 42, y: 12 }] },
  { label: "R upper bowl", points: [{ x: 42, y: 12 }, { x: 52, y: 15 }, { x: 58, y: 23 }] },
  { label: "R lower bowl", points: [{ x: 58, y: 23 }, { x: 59, y: 34 }, { x: 50, y: 43 }, { x: 12, y: 43 }] },
  { label: "R leg upper", points: [{ x: 31, y: 43 }, { x: 43, y: 55 }] },
  { label: "R leg lower", points: [{ x: 43, y: 55 }, { x: 57, y: 72 }] },

  // I — cap, shaft and foot
  { label: "I cap", points: [{ x: 78, y: 12 }, { x: 108, y: 12 }] },
  { label: "I shaft", points: [{ x: 93, y: 12 }, { x: 93, y: 72 }] },
  { label: "I foot", points: [{ x: 78, y: 72 }, { x: 108, y: 72 }] },

  // A — split legs and crossbar
  { label: "A left lower", points: [{ x: 130, y: 72 }, { x: 140, y: 43 }] },
  { label: "A left upper", points: [{ x: 140, y: 43 }, { x: 151, y: 12 }] },
  { label: "A right upper", points: [{ x: 151, y: 12 }, { x: 162, y: 43 }] },
  { label: "A right lower", points: [{ x: 162, y: 43 }, { x: 173, y: 72 }] },
  { label: "A crossbar", points: [{ x: 137, y: 49 }, { x: 165, y: 49 }] },

  // D — stem and four connected outer edges
  { label: "D stem", points: [{ x: 194, y: 12 }, { x: 194, y: 72 }] },
  { label: "D top", points: [{ x: 194, y: 12 }, { x: 216, y: 12 }] },
  { label: "D upper curve", points: [{ x: 216, y: 12 }, { x: 235, y: 16 }, { x: 246, y: 29 }] },
  { label: "D lower curve", points: [{ x: 246, y: 29 }, { x: 249, y: 49 }, { x: 235, y: 65 }] },
  { label: "D foot", points: [{ x: 235, y: 65 }, { x: 216, y: 72 }, { x: 194, y: 72 }] },

  // Star — five independently drawn rays converging at the centre
  { label: "Star top", points: [{ x: 282, y: 42 }, { x: 299, y: 10 }] },
  { label: "Star upper right", points: [{ x: 282, y: 42 }, { x: 316, y: 31 }] },
  { label: "Star lower right", points: [{ x: 282, y: 42 }, { x: 309, y: 72 }] },
  { label: "Star lower left", points: [{ x: 282, y: 42 }, { x: 282, y: 78 }] },
  { label: "Star upper left", points: [{ x: 282, y: 42 }, { x: 258, y: 20 }] },
];

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export function getSignatureStrokeLength(index: number): number {
  const stroke = SIGNATURE_STROKES[index];
  if (!stroke) return 0;

  let total = 0;
  for (let i = 1; i < stroke.points.length; i += 1) {
    const previous = stroke.points[i - 1];
    const current = stroke.points[i];
    total += Math.hypot(
      current.x - previous.x,
      current.y - previous.y,
    );
  }
  return total;
}

export function getSignatureStrokePoint(
  index: number,
  progress: number,
): SignaturePoint {
  const stroke = SIGNATURE_STROKES[index];
  if (!stroke || stroke.points.length === 0) return { x: 0, y: 0 };
  const points = stroke.points;
  if (progress <= 0) return points[0];
  if (progress >= 1) return points[points.length - 1];

  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const length = Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
    lengths.push(length);
    total += length;
  }

  let remaining = clamp01(progress) * total;
  for (let i = 0; i < lengths.length; i += 1) {
    const length = lengths[i];
    if (remaining <= length || i === lengths.length - 1) {
      const t = length === 0 ? 0 : Math.min(1, remaining / length);
      const start = points[i];
      const end = points[i + 1];
      return {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      };
    }
    remaining -= length;
  }

  return points[points.length - 1];
}
