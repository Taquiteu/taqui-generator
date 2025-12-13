import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import { GlassPanel } from "../../components/GlassPanel";
import { PageShell } from "../../components/PageShell";

type IpState =
	| { status: "loading" }
	| { status: "success"; ip: string }
	| { status: "error"; message: string };

export const ipMeta: MetaFunction = () => {
	return [
		{ title: "Táqui - Meu IP" },
		{
			name: "description",
			content: "Veja seu IP público.",
		},
	];
};

export function IpPage() {
	const [ipState, setIpState] = useState<IpState>({ status: "loading" });
	const [imageUrl, setImageUrl] = useState<string>("");

	const loadIp = async () => {
		setIpState({ status: "loading" });
		setImageUrl("");
		try {
			const response = await fetch("https://api.ipify.org?format=json");
			const data = (await response.json()) as { ip?: string };
			if (!data.ip) throw new Error("IP não encontrado");
			setIpState({ status: "success", ip: data.ip });
			setImageUrl(`/api/generate-image?text=${encodeURIComponent(data.ip)}`);
		} catch (error) {
			console.error(error);
			setIpState({
				status: "error",
				message: "Não foi possível descobrir seu IP.",
			});
		}
	};

	useEffect(() => {
		void loadIp();
	}, []);

	const renderStatus = () => {
		if (ipState.status === "loading") {
			return (
				<p className="text-sm text-white/85">
					Descobrindo seu IP público...
				</p>
			);
		}

		if (ipState.status === "error") {
			return (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-white/90">{ipState.message}</p>
					<button
						type="button"
						onClick={() => void loadIp()}
						className="taqui-btn w-fit px-4 py-2 text-base"
					>
						Tentar de novo
					</button>
				</div>
			);
		}

		return (
			<div className="flex flex-wrap items-center gap-3">
				<p className="text-lg font-bold leading-tight">
					Seu IP público:{" "}
					<span className="underline">{ipState.ip}</span>
				</p>
				<button
					type="button"
					onClick={() => void loadIp()}
					className="taqui-btn px-4 py-2 text-base"
				>
					Atualizar IP
				</button>
			</div>
		);
	};

	return (
		<PageShell
			title="Meu IP em texto e imagem"
			description="Esta página busca seu IP público e gera a arte “Tá aqui” com o número do seu IP."
		>
			<div className="grid w-full gap-6 lg:grid-cols-2">
				<GlassPanel tone="strong" className="flex flex-col gap-4">
					<div>
						<h2 className="taqui-heading text-lg font-bold leading-tight">
							IP detectado automaticamente
						</h2>
						{renderStatus()}
					</div>
				</GlassPanel>

				<GlassPanel tone="soft" className="flex flex-col gap-4">
					<div className="flex items-center justify-between gap-2">
						<h2 className="taqui-heading text-lg font-bold leading-tight">
							Imagem com seu IP
						</h2>
						<span className="rounded-full border border-white/60 bg-white/15 px-3 py-1 text-xs font-bold uppercase text-white/90">
							Gerado automaticamente
						</span>
					</div>
					<div className="overflow-hidden rounded-2xl border-[3px] border-black bg-white">
						{imageUrl ? (
							<img
								src={imageUrl}
								alt="Imagem com IP"
								className="h-full w-full max-h-80 object-contain"
							/>
						) : (
							<div className="flex h-72 items-center justify-center bg-white/60 text-center text-sm font-semibold text-gray-800">
								{ipState.status === "loading"
									? "Gerando imagem com seu IP..."
									: "Imagem não disponível no momento."}
							</div>
						)}
					</div>
				</GlassPanel>
			</div>
		</PageShell>
	);
}
