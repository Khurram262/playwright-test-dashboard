import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TestRun } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

    