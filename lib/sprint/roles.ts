export const SPRINT_ROLES = ["pm", "developer", "designer", "marketer", "sales", "analyst"] as const;
export type SprintRole = (typeof SPRINT_ROLES)[number];

export function normalizeSprintRole(input: string): SprintRole | string {
  const r = input.trim().toLowerCase();
  switch (r) {
    case "pm":
    case "product manager":
      return "pm";
    case "dev":
    case "developer":
    case "engineer":
      return "developer";
    case "design":
    case "designer":
    case "ux":
      return "designer";
    case "marketing":
    case "marketer":
      return "marketer";
    case "sales":
      return "sales";
    case "analyst":
    case "data":
      return "analyst";
    default:
      return r; // pass through unknown, we won't block
  }
}
