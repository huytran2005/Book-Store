<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mandatory Agent Requirements

## 1. Taste Skill (design-taste-frontend)
You MUST read and strictly follow the design guidelines defined in [.agents/skills/design-taste-frontend/SKILL.md](file:///.agents/skills/design-taste-frontend/SKILL.md). Before generating or updating any frontend interfaces, landing pages, portfolios, or layouts, declare a "Design Read" and respect the three dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`). Absolutely avoid LLM design clichés (AI-purple, centered hero over dark mesh, 3-card grid repetitions, text-on-text buttons, wrapped CTAs).

## 2. Codegraph & Architecture
Always map out the codebase using code navigation or structural tools (Codegraph/Grep) before making major structural edits. Respect Next.js 14 App Router layout hierarchies and enforce separation between Server Components (RSC) and Client Components (interactivity, motion, hooks).
