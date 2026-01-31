import {
	CalendarBlankIcon,
	CopyIcon,
	LockSimpleIcon,
	RocketLaunchIcon,
} from "@phosphor-icons/react";
import { Link, useLoaderData } from "react-router";
import { PageShell } from "../../components/PageShell";
import { taquiToastPresets, useToast } from "../../components/Toast";

type PoolCard = {
	id: string;
	name: string;
	description: string;
	type: "number" | "text";
	visibility: "public" | "private";
	status: "open" | "closed";
	closesAt: number;
	ownerName: string;
	hasImage: boolean;
};

type LoaderData = {
	user: { id: string; displayName: string } | null;
	publicPools: PoolCard[];
	myPools: PoolCard[];
};

function formatDate(value: number) {
	return new Date(value).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function PoolList({
	title,
	pools,
	showCopyLink,
	onCopyLink,
}: {
	title: string;
	pools: PoolCard[];
	showCopyLink?: boolean;
	onCopyLink?: (poolId: string) => void;
}) {
	return (
		<div className="w-full max-w-[900px] rounded-lg border-2 border-black bg-white font-mono text-black shadow-[4px_4px_0_#000000]">
			<div className="flex items-center justify-between border-b-2 border-black px-4 py-3 sm:px-6">
				<p className="text-xl font-bold leading-7">{title}</p>
				<span className="text-sm text-black/70">{pools.length}</span>
			</div>

			{pools.length === 0 ? (
				<div className="p-6 text-center text-black/70">Nenhuma pool por aqui.</div>
			) : (
				<ul className="flex flex-col">
					{pools.map((pool) => (
						<li
							key={pool.id}
							className="flex flex-col gap-4 border-b-2 border-black px-4 py-4 sm:flex-row sm:items-center sm:px-6"
						>
							<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000000]">
								{pool.hasImage ? (
									<img
										src={`/api/apostas/pool-image/${pool.id}`}
										alt={pool.name}
										className="h-full w-full object-cover"
										loading="lazy"
									/>
								) : (
									<RocketLaunchIcon className="h-7 w-7 text-black/70" />
								)}
							</div>

							<div className="min-w-0 flex-1">
								<p className="truncate text-lg font-bold leading-7">{pool.name}</p>
								<p className="text-sm leading-5 text-black/70">{pool.description}</p>
								<div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-black/70">
									<span className="rounded-full border border-black bg-[#FFF129] px-3 py-1 shadow-[2px_2px_0_#000000]">
										{pool.type === "number" ? "Número" : "Texto"}
									</span>
									<span className="rounded-full border border-black bg-white px-3 py-1 shadow-[2px_2px_0_#000000]">
										{pool.status === "open" ? "Aberta" : "Fechada"}
									</span>
									<span className="rounded-full border border-black bg-[#47B8FF] px-3 py-1 shadow-[2px_2px_0_#000000]">
										<CalendarBlankIcon className="mr-1 inline h-4 w-4" />
										{formatDate(pool.closesAt)}
									</span>
									<span className="rounded-full border border-black bg-white px-3 py-1 shadow-[2px_2px_0_#000000]">
										{pool.visibility === "public" ? "Pública" : "Privada"}
									</span>
								</div>
							</div>

							<div className="flex flex-col items-start gap-2 sm:items-end">
								<p className="text-sm text-black/70">Dono: {pool.ownerName}</p>
								<div className="flex flex-wrap items-center gap-2">
									{showCopyLink && onCopyLink && (
											<button
												type="button"
												onClick={() => onCopyLink(pool.id)}
												className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
											>
												<CopyIcon className="h-5 w-5" weight="bold" />
												Copiar link
											</button>
									)}
									<Link
										to={`/apostas/pool/${pool.id}`}
										className="flex h-11 items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
									>
										Abrir
									</Link>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export function ApostasPage() {
	const data = useLoaderData() as LoaderData;
	const toast = useToast();

	const handleCopyLink = async (poolId: string) => {
		if (typeof window === "undefined") return;
		const url = `${window.location.origin}/apostas/pool/${poolId}`;
		try {
			await navigator.clipboard.writeText(url);
			toast({
				...taquiToastPresets.success,
				title: "TÁQUI!",
				message: "Link copiado.",
			});
		} catch {
			toast({
				...taquiToastPresets.error,
				title: "DEU RUIM!",
				message: "Não foi possível copiar o link.",
			});
		}
	};

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center gap-6">
				<div className="w-full max-w-[900px] rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-2xl font-bold leading-8">Táqui Apostas</p>
							<p className="text-sm leading-5 text-black/70">
								Crie pools, participe e veja quem chega mais perto.
							</p>
						</div>
						<div className="flex items-center gap-2">
							{data.user ? (
								<Link
									to="/apostas/criar"
									className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								>
									Criar pool
								</Link>
							) : (
								<Link
									to={`/contas/login?redirectTo=${encodeURIComponent("/apostas/criar")}`}
									className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								>
									<LockSimpleIcon className="h-5 w-5" weight="bold" />
									Entrar
								</Link>
							)}
						</div>
					</div>
				</div>

				{data.user && (
					<PoolList
						title="Minhas pools"
						pools={data.myPools}
						showCopyLink
						onCopyLink={handleCopyLink}
					/>
				)}
				<PoolList
					title="Pools públicas"
					pools={data.publicPools}
					showCopyLink
					onCopyLink={handleCopyLink}
				/>
			</div>
		</PageShell>
	);
}
