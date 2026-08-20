"use client";

import { MediaField } from "@/components/admin/MediaField";
import type { MediaAttachTarget } from "@/actions/admin/upload";

export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  hint,
  altName,
  defaultAlt,
  focusName,
  defaultFocus,
  persist,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  altName?: string;
  defaultAlt?: string;
  focusName?: string;
  defaultFocus?: string;
  persist?: { target: MediaAttachTarget; id?: string; field: string };
}) {
  return (
    <MediaField
      name={name}
      label={label}
      defaultValue={defaultValue}
      kind="image"
      folder="articles"
      hint={hint}
      altName={altName}
      defaultAlt={defaultAlt}
      focusName={focusName}
      defaultFocus={defaultFocus}
      persist={persist}
    />
  );
}
