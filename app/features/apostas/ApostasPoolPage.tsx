import { useEffect } from "react";
import {
	CalendarBlankIcon,
	CopyIcon,
	LockSimpleIcon,
	TrophyIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import { PageShell } from "../../components/PageShell";
import { taquiToastPresets, useToast } from "../../components/Toast";

type GuessCard = {
	id: string;
	userId: string;
	userName: string;
	value: string;
	createdAt: number;
	updatedAt: number;
	isWinner: boolean;
	isMine: boolean;
};

type PoolData = {
	id: string;
	name: string;
	description: string;
	type: "number" | "text";
	visibility: "public" | "private";
	status: "open" | "closed";
	closesAt: number;
	createdAt: number;
	ownerId: string;
	ownerName: string;
	hasImage: boolean;
	resultNumber?: number | null;
	winnerGuessId?: string | null;
	winnerUserId?: string | null;
	closedAt?: number | null;
};

type LoaderData = {
	pool: PoolData;
	guesses: GuessCard[];
	user: { id: string; displayName: string } | null;
	userGuess: { id: string; value: string; numericValue: number | null } | null;
	isOwner: boolean;
	canGuess: boolean;
	isExpired: boolean;
	winner: { userName: string; value: string; userId: string } | null;
};

type ActionData = { ok: true; message: string } | { ok: false; error: string };

function formatDate(value: number) {
	return new Date(value).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function ApostasPoolPage() {
	const data = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData | undefined;
	const toast = useToast();

	const copyLink = async () => {
		if (typeof window === "undefined") return;
		try {
			await navigator.clipboard.writeText(window.location.href);
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

	useEffect(() => {
		if (!actionData) return;
		if (actionData.ok) {
			toast({
				...taquiToastPresets.success,
				title: "TÁQUI!",
				message: actionData.message,
			});
			return;
		}
		toast({
			...taquiToastPresets.error,
			title: "DEU RUIM!",
			message: actionData.error,
		});
	}, [actionData, toast]);

	const statusLabel =
		data.pool.status === "closed"
			? "Fechada"
			: data.isExpired
				? "Aguardando fechamento"
				: "Aberta";

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-10">
			<div className="flex w-full flex-col items-center gap-6">
				<div className="w-full max-w-[1000px] rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex items-start gap-4">
							<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000]">
								{data.pool.hasImage ? (
									<img
										src={`/api/apostas/pool-image/${data.pool.id}`}
										alt={data.pool.name}
										className="h-full w-full object-cover"
										loading="lazy"
									/>
								) : (
									<UsersThreeIcon className="h-9 w-9 text-black" weight="bold" />
								)}
							</div>
							<div className="min-w-0">
								<p className="text-2xl font-bold leading-8">{data.pool.name}</p>
								<p className="text-sm leading-5 text-black/70">
									{data.pool.description}
								</p>
								<div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-black/70">
									<span className="rounded-full border border-black bg-[#FFF129] px-3 py-1 shadow-[2px_2px_0_#000000]">
										{data.pool.type === "number" ? "Número" : "Texto"}
									</span>
									<span className="rounded-full border border-black bg-white px-3 py-1 shadow-[2px_2px_0_#000000]">
										{data.pool.visibility === "public" ? "Pública" : "Privada"}
									</span>
									<span className="rounded-full border border-black bg-white px-3 py-1 shadow-[2px_2px_0_#000000]">
										{statusLabel}
									</span>
									<span className="rounded-full border border-black bg-[#47B8FF] px-3 py-1 shadow-[2px_2px_0_#000000]">
										<CalendarBlankIcon className="mr-1 inline h-4 w-4" />
										{formatDate(data.pool.closesAt)}
									</span>
								</div>
							</div>
						</div>
						<div className="flex flex-col items-start gap-2 text-sm font-bold text-black/70 sm:items-end">
							<p>Dono: {data.pool.ownerName}</p>
							<Link
								to="/apostas"
								className="flex h-10 items-center justify-center rounded-lg border-2 border-black bg-white px-3 text-sm font-bold text-black shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
							>
								Voltar
							</Link>
							{data.pool.visibility === "private" && (
								<button
									type="button"
									onClick={copyLink}
									className="flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] px-3 text-sm font-bold text-black shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								>
									<CopyIcon className="h-4 w-4" weight="bold" />
									Copiar link
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="grid w-full max-w-[1000px] gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<div className="flex flex-col gap-6">
						<div className="rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
							<p className="text-xl font-bold leading-7">Seu palpite</p>

							{data.user ? (
								data.canGuess ? (
									<Form method="post" className="mt-4 flex flex-col gap-3">
										<input type="hidden" name="intent" value="guess" />
										<label className="flex flex-col gap-2">
											<span className="text-sm font-bold">
												{data.pool.type === "number"
													? "Qual número você aposta?"
													: "Qual é o seu palpite?"}
											</span>
											<input
												name="guessValue"
												type={data.pool.type === "number" ? "number" : "text"}
												step={data.pool.type === "number" ? "1" : undefined}
												defaultValue={data.userGuess?.value ?? ""}
												placeholder={
													data.pool.type === "number" ? "Ex: 42" : "Ex: Brasil"
												}
												className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
											/>
										</label>
										<button
											type="submit"
											className="flex h-[52px] w-full items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
										>
											Salvar palpite
										</button>
										<p className="text-xs font-bold text-black/60">
											Você pode editar até {formatDate(data.pool.closesAt)}.
										</p>
									</Form>
								) : (
									<p className="mt-3 text-sm font-bold text-black/70">
										Essa pool já fechou para palpites.
									</p>
								)
							) : (
								<Link
									to={`/contas/login?redirectTo=${encodeURIComponent(
										`/apostas/pool/${data.pool.id}`,
									)}`}
									className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-white text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								>
									<LockSimpleIcon className="h-5 w-5" weight="bold" />
									Entrar para palpitar
								</Link>
							)}
						</div>

						<div className="rounded-lg border-2 border-black bg-white font-mono text-black shadow-[4px_4px_0_#000000]">
							<div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
								<p className="text-lg font-bold">Palpites</p>
								<span className="text-sm text-black/70">{data.guesses.length}</span>
							</div>
							{data.guesses.length === 0 ? (
								<div className="p-6 text-center text-sm text-black/70">
									Ninguém palpitou ainda.
								</div>
							) : (
								<ul className="flex flex-col">
									{data.guesses.map((guess) => (
										<li
											key={guess.id}
											className={`flex items-center justify-between gap-4 border-b-2 border-black px-4 py-3 text-sm font-bold ${
												guess.isWinner ? "bg-[#FFF129]" : "bg-white"
											}`}
										>
											<div className="min-w-0">
												<p className="truncate">{guess.value}</p>
												<p className="text-xs font-normal text-black/70">
													{guess.userName}
													{guess.isMine ? " (você)" : ""}
												</p>
											</div>
											{guess.isWinner && (
												<TrophyIcon className="h-5 w-5 shrink-0" weight="bold" />
											)}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-6">
						{data.pool.status === "closed" && (
							<div className="rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
								<p className="text-lg font-bold">Resultado</p>
								{data.pool.type === "number" ? (
									<p className="mt-3 text-2xl font-bold">
										Número final: {data.pool.resultNumber ?? "--"}
									</p>
								) : (
									<p className="mt-3 text-2xl font-bold">Texto escolhido</p>
								)}
								{data.winner ? (
									<div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-black bg-[#FFF129] px-4 py-3 shadow-[2px_2px_0_#000000]">
										<TrophyIcon className="h-6 w-6" weight="bold" />
										<div>
											<p className="text-sm font-bold">{data.winner.userName}</p>
											<p className="text-sm">{data.winner.value}</p>
										</div>
									</div>
								) : (
									<p className="mt-3 text-sm text-black/70">
										Sem vencedor definido.
									</p>
								)}
								{data.pool.closedAt && (
									<p className="mt-3 text-xs text-black/60">
										Encerrada em {formatDate(data.pool.closedAt)}
									</p>
								)}
							</div>
						)}

						{data.isOwner && data.pool.status === "open" && (
							<div className="rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
								<p className="text-lg font-bold">Fechar pool</p>
								<Form method="post" className="mt-4 flex flex-col gap-3">
									<input type="hidden" name="intent" value="close" />
									{data.pool.type === "number" ? (
										<label className="flex flex-col gap-2">
											<span className="text-sm font-bold">Resultado numérico</span>
											<input
												name="resultNumber"
												type="number"
												step="1"
												placeholder="Ex: 52"
												className="h-[52px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
												required
											/>
										</label>
									) : (
										<label className="flex flex-col gap-2">
											<span className="text-sm font-bold">Escolha o vencedor</span>
											<select
												name="winnerGuessId"
												className="h-[52px] w-full rounded-lg border-2 border-black bg-white px-4 text-base font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
												defaultValue=""
												disabled={data.guesses.length === 0}
												required={data.guesses.length > 0}
											>
												<option value="" disabled>
													{data.guesses.length === 0
														? "Sem palpites ainda"
														: "Selecione um palpite"}
												</option>
												{data.guesses.map((guess) => (
													<option key={guess.id} value={guess.id}>
														{guess.value} — {guess.userName}
													</option>
												))}
											</select>
										</label>
									)}
									<button
										type="submit"
										className="flex h-[52px] w-full items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
									>
										Encerrar pool
									</button>
									<p className="text-xs text-black/60">
										O encerramento é definitivo e trava os palpites.
									</p>
								</Form>
							</div>
						)}
					</div>
				</div>
			</div>
		</PageShell>
	);
}
