import type { Component } from "svelte";
import type { SEX_KEY } from "./constant";
import { Mars, Venus, type IconProps } from "@lucide/svelte";
export const SEX_ICON_MAP: Record<SEX_KEY, Component<IconProps, {}, "">> = {
  1: Mars, // blue for male
  2: Venus, // pink for female
};
