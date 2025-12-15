import { useEffect, useState } from "react";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useLoaderData } from "react-router";
import type { Link } from "../../.server/Link";
import { PageShell } from "../../components/PageShell";

export function RedirectLinkPage() {
	const data = useLoaderData<Link>();
	const [secondsRemaining, setSecondsRemaining] = useState(5);

	useEffect(() => {
		if (secondsRemaining === 0) {
			window.location.href = data.url;
			return;
		}

		const timer = setTimeout(() => {
			setSecondsRemaining((prev) => prev - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [data.url, secondsRemaining]);

	const openNow = () => {
		window.location.href = data.url;
	};

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center">
				<div className="w-full max-w-[540px] rounded-lg border-[3px] border-black bg-white p-4 font-mono text-black shadow-[2px_2px_0_#000000]">
					<h1 className="text-2xl font-bold leading-9">Segura a Emoção!</h1>
					<p className="mt-2 text-sm leading-6">
						Você será redirecionado em{" "}
						<span className="font-bold">{secondsRemaining}s</span> para:
					</p>
					<a
						href={data.url}
						className="mt-2 block break-all text-sm font-semibold underline"
					>
						{data.url}
					</a>

					<div className="mt-4">
						<button
							type="button"
							onClick={openNow}
							className="flex h-[60px] w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#FFF129] px-[14px] py-3 text-2xl font-bold leading-9 text-black"
						>
							<ArrowSquareOutIcon className="h-7 w-7" weight="bold" />
							Abrir agora
						</button>
					</div>
				</div>

				<div className="mt-10 w-full max-w-[540px] overflow-hidden rounded-lg border-[3px] border-black bg-white">
					<div className="flex h-[61px] items-center justify-center px-[27px]">
						<p className="w-full truncate text-center font-['Roboto_Flex'] text-xl font-bold leading-tight text-black sm:text-2xl md:text-[32px] md:leading-[38px]">
							{data.contexto}
						</p>
					</div>
					<div className="w-full aspect-[720/564]">
						<img
							src={`/api/generate-image?text=${encodeURIComponent(data.contexto)}`}
							alt="Imagem gerada"
							className="h-full w-full object-cover object-bottom"
						/>
					</div>
				</div>
			</div>
		</PageShell>
	);
}

