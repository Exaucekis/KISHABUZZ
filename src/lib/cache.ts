import { refresh, revalidatePath, revalidateTag, updateTag } from "next/cache";

export const CACHE_TAGS = {
  home: "home",
  settings: "settings",
  arena: "arena",
} as const;

export function revalidatePublic() {
  revalidateTag(CACHE_TAGS.home, "max");
  revalidateTag(CACHE_TAGS.settings, "max");
  revalidateTag(CACHE_TAGS.arena, "max");
  revalidatePath("/", "layout");
  revalidatePath("/arena-culture", "layout");
}

/** Immediate read-your-writes from a Server Action (not during page render). */
export function applyPublicWrites() {
  updateTag(CACHE_TAGS.home);
  updateTag(CACHE_TAGS.settings);
  updateTag(CACHE_TAGS.arena);
  refresh();
  revalidatePublic();
}
