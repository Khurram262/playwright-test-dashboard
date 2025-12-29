import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      aria-hidden="true"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        d="M128 24a104 104 0 1 0 104 104A104.1 104.1 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Z"
        fill="currentColor"
        className="text-muted-foreground/50"
      />
      <path
        d="m164.4 145.2-46.8-27.1a15.9 15.9 0 0 0-23.2 13.9v54.2a15.9 15.9 0 0 0 23.2 13.9l46.8-27.1a16 16 0 0 0 0-27.8Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  );
}
