import { isLiveEventStatus } from "@/lib/event-capacity";

export const EVENT_LIST_VIEWS = ["en-cours", "brouillons", "passes", "tous"] as const;
export type EventListView = (typeof EVENT_LIST_VIEWS)[number];

export const EVENT_EDIT_TABS = ["en-cours", "fiche", "journal"] as const;
export type EventEditTab = (typeof EVENT_EDIT_TABS)[number];

export function parseEventListView(value: string | undefined): EventListView {
  if (value === "brouillons" || value === "passes" || value === "tous") return value;
  return "en-cours";
}

export function matchesEventListView(status: string, view: EventListView) {
  if (view === "tous") return true;
  if (view === "en-cours") return isLiveEventStatus(status);
  if (view === "brouillons") return status === "DRAFT";
  return status === "ENDED" || status === "CANCELLED";
}

export function parseEventEditTab(value: string | undefined, status: string): EventEditTab {
  if (value === "fiche" || value === "journal" || value === "en-cours") return value;
  return isLiveEventStatus(status) ? "en-cours" : "fiche";
}
