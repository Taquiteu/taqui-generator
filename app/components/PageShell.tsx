import type { ReactNode } from "react";

type PageShellProps = {
	title?: string;
	description?: string;
	children: ReactNode;
	align?: "center" | "start";
	showLogo?: boolean;
	actions?: ReactNode;
	containerClassName?: string;
};

export function PageShell({
	title,
	description,
	children,
	align = "center",
	showLogo = true,
	actions,
	containerClassName = "",
}: PageShellProps) {
	const alignment =
		align === "start" ? "items-start text-left" : "items-center text-center";

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#07B8FF] px-4 py-8">
			<div className="pointer-events-none absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 scale-150 origin-[48%_52%] bg-[url('/assets/taqui-o-background.png')] bg-cover bg-center opacity-100 will-change-transform animate-spin-slower" />

			<div
				className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 text-white ${alignment} ${containerClassName}`}
			>
				<div className={`flex flex-col gap-4 ${alignment}`}>
					{showLogo && (
						<img
							src="/assets/taqui-a-logo.png"
							alt="Táqui Generator"
							className="h-auto w-[240px] max-w-full drop-shadow-[0_10px_0_rgba(0,0,0,0.35)]"
							onClick={() => window.location.href = "/"}
							style={{ cursor: "pointer" }}
						/>
					)}

					{title && (
						<h1 className="taqui-title text-3xl font-black sm:text-4xl">
							{title}
						</h1>
					)}

					{description && (
						<p className="max-w-3xl text-base text-white/90 sm:text-lg">
							{description}
						</p>
					)}

					{actions && (
						<div className="flex flex-wrap gap-3 text-left">{actions}</div>
					)}
				</div>

				{children}
			</div>
		</div>
	);
}
