import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function PublicImage({ src, alt, className, fill, sizes, priority }: Props) {
  const remote = /^https?:\/\//i.test(src);
  if (remote) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={fill ? `absolute inset-0 h-full w-full ${className || ""}` : className}
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <Image src={src} alt={alt} fill={fill} sizes={sizes} priority={priority} className={className} />
  );
}
