import { useEffect, useState } from "react";
import { CopyIcon } from "@phosphor-icons/react";
import type { MetaFunction } from "react-router";
import { PageShell } from "../../components/PageShell";
import useNotification from "../../hooks/useNotification";

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
	const [buttonText, setButtonText] = useState("Copiar");
	const showNotification = useNotification();

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

	const copyIp = async () => {
		if (ipState.status !== "success") return;

		try {
			await navigator.clipboard.writeText(ipState.ip);
			setButtonText("Copiado!");
			setTimeout(() => {
				setButtonText("Copiar");
			}, 2000);
			showNotification("IP copiado para o clipboard!");
		} catch (error) {
			console.error("Erro ao copiar o IP: ", error);
			showNotification("Não foi possível copiar o IP.");
		}
	};

	const ipValue = ipState.status === "success" ? ipState.ip : "";
	const placeholder =
		ipState.status === "error" ? "IP indisponível" : "Descobrindo seu IP...";
	const isLoading = ipState.status === "loading";
	const hasError = ipState.status === "error";
	const buttonLabel = hasError ? "Recarregar" : buttonText;
	const canCopy = ipState.status === "success";

	return (
		<PageShell
			showLogo
			containerClassName="max-w-[1200px] gap-12"
		>
			<div className="flex w-full flex-col items-center">
				<div className="flex w-full max-w-[540px] flex-col gap-6 sm:flex-row sm:items-start">
					<label htmlFor="taqui-ip" className="sr-only">
						Seu IP público
					</label>
					<input
						id="taqui-ip"
						type="text"
						value={ipValue}
						readOnly
						placeholder={placeholder}
						className="h-[60px] w-full flex-1 rounded-lg border-[3px] border-black bg-white p-4 font-mono text-2xl leading-7 text-black placeholder:text-[#B1B1B1] focus:outline-none"
					/>

					<button
						type="button"
						disabled={isLoading}
						onClick={() => {
							if (hasError) {
								void loadIp();
								return;
							}

							void copyIp();
						}}
						className="flex h-[60px] w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#FFF129] px-[14px] py-3 font-mono text-2xl font-bold leading-9 text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-[151px]"
					>
						{canCopy && buttonText === "Copiar" && (
							<CopyIcon className="h-7 w-7" weight="bold" />
						)}
						{buttonLabel}
					</button>
				</div>

				{imageUrl && (
					<div className="mt-10 w-full max-w-[540px] overflow-hidden rounded-lg border-[3px] border-black bg-white">
						<div className="flex h-[61px] items-center justify-center px-[27px]">
							<p className="w-full truncate text-center font-['Roboto_Flex'] text-xl font-bold leading-tight text-black sm:text-2xl md:text-[32px] md:leading-[38px]">
								{ipValue}
							</p>
						</div>
						<div className="w-full aspect-[720/564]">
							<img
								src={imageUrl}
								alt="Imagem com IP"
								className="h-full w-full object-cover object-bottom"
							/>
						</div>
					</div>
				)}

				{hasError && (
					<p className="mt-4 max-w-[540px] text-left text-sm text-white/90">
						{ipState.message}
					</p>
				)}
			</div>
		</PageShell>
	);
}
