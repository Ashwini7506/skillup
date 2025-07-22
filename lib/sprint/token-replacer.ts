import { SprintTeamClient } from "@/utils/sprintHub/types";


export function renderTokens(text: string, team: SprintTeamClient): string {
  if (!text) return "";
  const roleMap: Record<string, string> = {};

  team.members.forEach((m) => {
    const key = m.sprintRole.toLowerCase();
    roleMap[key] = m.name;
    switch (key) {
      case "product manager":
      case "pm":
        roleMap["pm"] = m.name;
        break;
      case "developer":
      case "dev":
        roleMap["developer"] = m.name;
        break;
      case "designer":
      case "design":
        roleMap["designer"] = m.name;
        break;
      case "marketer":
      case "marketing":
        roleMap["marketer"] = m.name;
        break;
      case "sales":
        roleMap["sales"] = m.name;
        break;
      case "analyst":
      case "data":
        roleMap["analyst"] = m.name;
        break;
    }
  });

  return text
    .replace(/{{pm\.name}}/gi, roleMap["pm"] ?? "PM")
    .replace(/{{dev\.name}}/gi, roleMap["developer"] ?? "Developer")
    .replace(/{{designer\.name}}/gi, roleMap["designer"] ?? "Designer")
    .replace(/{{marketer\.name}}/gi, roleMap["marketer"] ?? "Marketer")
    .replace(/{{sales\.name}}/gi, roleMap["sales"] ?? "Sales Lead")
    .replace(/{{analyst\.name}}/gi, roleMap["analyst"] ?? "Analyst")
    .replace(
      /{{sprint\.endDate\|date}}/gi,
      new Date(team.cohort.endDate).toLocaleDateString()
    );
}
