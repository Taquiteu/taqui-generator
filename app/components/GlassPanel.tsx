import type { ReactNode } from "react";

type GlassPanelProps = {
	children: ReactNode;
	className?: string;
	tone?: "soft" | "strong";
};

const toneMap: Record<NonNullable<GlassPanelProps["tone"]>, string> = {
	soft: "bg-white/10",
	strong: "bg-white/15",
};

export function GlassPanel({
	children,
	className = "",
	tone = "soft",
}: GlassPanelProps) {
	const toneClasses = toneMap[tone];
	return (
		<div
			className={`rounded-[28px] border-[3px] border-white/70 p-5 shadow-[0_12px_0_rgba(0,0,0,0.25)] backdrop-blur-lg ${toneClasses} ${className}`}
		>
			{children}
		</div>
	);
}
