export type EditorialCounts = {
  drafts: number;
  scheduled: number;
  contactsNew: number;
  arenaDrafts: number;
};

export function articleTypeLabel(type: string) {
  if (type === "CHRONIQUE") return "Chronique";
  if (type === "ANALYSIS") return "Analyse";
  return "Publication";
}

export function editorialHeadline(counts: EditorialCounts) {
  const parts: string[] = [];
  if (counts.drafts) {
    parts.push(`${counts.drafts} brouillon${counts.drafts > 1 ? "s" : ""}`);
  }
  if (counts.scheduled) {
    parts.push(`${counts.scheduled} programmé${counts.scheduled > 1 ? "s" : ""}`);
  }
  if (counts.contactsNew) {
    parts.push(`${counts.contactsNew} contact${counts.contactsNew > 1 ? "s" : ""} à traiter`);
  }
  if (counts.arenaDrafts) {
    parts.push(
      `${counts.arenaDrafts} émission${counts.arenaDrafts > 1 ? "s" : ""} Arena en brouillon`
    );
  }
  if (!parts.length) return "Rien en attente. Le calendrier est à jour.";
  return `À traiter : ${parts.join(" · ")}.`;
}
