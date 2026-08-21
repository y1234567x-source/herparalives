import Image from "next/image";
import { getPortrait } from "@/lib/portraits";

export function Portrait({ id, size = "large" }: { id: number; size?: "small" | "large" }) {
  const portrait = getPortrait(id);
  return <div className={`portrait portrait-${size}`} aria-label={`${portrait.name}的手绘角色立绘`}><Image src={portrait.src} alt={`${portrait.name}的手绘角色立绘`} fill sizes={size === "small" ? "110px" : "380px"} /></div>;
}
