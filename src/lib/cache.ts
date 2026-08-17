import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  home: "home",
  settings: "settings",
} as const;

export function revalidatePublic() {
  revalidateTag(CACHE_TAGS.home, "max");
  revalidateTag(CACHE_TAGS.settings, "max");
  revalidatePath("/");
}
