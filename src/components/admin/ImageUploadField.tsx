"use client";

import { MediaField } from "@/components/admin/MediaField";

export function ImageUploadField({
  name,
  label,
  defaultValue = "",
  hint,
  altName,
  defaultAlt,
  focusName,
  defaultFocus,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  altName?: string;
  defaultAlt?: string;
  focusName?: string;
  defaultFocus?: string;
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
    />
  );
}
