import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { ApostasPoolPage } from "../features/apostas/ApostasPoolPage";
import {
	getGuessByUser,
	getGuessesByPool,
	getPoolById,
	loadApostasStore,
	saveApostasStore,
	upsertGuess,
} from "../.server/apostasStore";
import { findAccountById, loadAccounts } from "../.server/accounts";
import { destroyAuthSession, getAuthSession, requireAuthUserId } from "../.server/authSession";
import { redirect } from "react-router";

export const meta: MetaFunction = () => [{ title: "Táqui Apostas" }];

function getString(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === "string" ? value.trim() : "";
}

function parseNumber(value: string) {
	const normalized = value.replace(",", ".").trim();
	if (!normalized) return null;
	const number = Number(normalized);
	return Number.isFinite(number) ? number : null;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const poolId = params.poolId;
	if (!poolId) {
		throw new Response("Pool não encontrada.", { status: 404 });
	}

	const store = loadApostasStore();
	const pool = getPoolById(store, poolId);
	if (!pool) {
		throw new Response("Pool não encontrada.", { status: 404 });
	}

	const accounts = loadAccounts();
	const userMap = new Map(accounts.users.map((user) => [user.id, user.displayName]));

	const session = await getAuthSession(request);
	const userId = session.get("userId");
	const currentUser =
		typeof userId === "string"
			? accounts.users.find((user) => user.id === userId) ?? null
			: null;

	const guesses = getGuessesByPool(store, poolId).sort((a, b) => a.createdAt - b.createdAt);
	const winnerGuess =
		pool.winnerGuessId ? guesses.find((guess) => guess.id === pool.winnerGuessId) ?? null : null;

	const now = Date.now();
	const isExpired = now > pool.closesAt;
	const canGuess = pool.status === "open" && !isExpired;
	const userGuess = currentUser ? getGuessByUser(store, poolId, currentUser.id) : null;

	return {
		pool: {
			...pool,
			ownerName: userMap.get(pool.ownerId) ?? pool.ownerId,
			hasImage: Boolean(pool.imagePath),
		},
		guesses: guesses.map((guess) => ({
			id: guess.id,
			userId: guess.userId,
			userName: userMap.get(guess.userId) ?? guess.userId,
			value: guess.value,
			createdAt: guess.createdAt,
			updatedAt: guess.updatedAt,
			isWinner: pool.winnerGuessId === guess.id,
			isMine: currentUser ? guess.userId === currentUser.id : false,
		})),
		user: currentUser ? { id: currentUser.id, displayName: currentUser.displayName } : null,
		userGuess: userGuess
			? {
					id: userGuess.id,
					value: userGuess.value,
					numericValue: userGuess.numericValue,
			  }
			: null,
		isOwner: currentUser ? currentUser.id === pool.ownerId : false,
		canGuess,
		isExpired,
		winner: winnerGuess
			? {
					userName: userMap.get(winnerGuess.userId) ?? winnerGuess.userId,
					value: winnerGuess.value,
					userId: winnerGuess.userId,
			  }
			: null,
	};
}

export async function action({ params, request }: ActionFunctionArgs) {
	const poolId = params.poolId;
	if (!poolId) {
		return { ok: false, error: "Pool inválida." } as const;
	}

	const formData = await request.formData();
	const intent = formData.get("intent");

	const store = loadApostasStore();
	const pool = getPoolById(store, poolId);
	if (!pool) {
		return { ok: false, error: "Pool não encontrada." } as const;
	}

	if (intent === "guess") {
		const userId = await requireAuthUserId(request);
		const user = findAccountById(userId);
		if (!user) {
			const session = await getAuthSession(request);
			throw redirect("/contas/login", {
				headers: { "Set-Cookie": await destroyAuthSession(session) },
			});
		}

		const now = Date.now();
		if (pool.status !== "open" || now > pool.closesAt) {
			return { ok: false, error: "Essa pool já fechou para palpites." } as const;
		}

		const rawValue = getString(formData, "guessValue");
		if (!rawValue) {
			return { ok: false, error: "Preencha seu palpite." } as const;
		}

		let numericValue: number | null = null;
		let value = rawValue;
		if (pool.type === "number") {
			const parsed = parseNumber(rawValue);
			if (parsed === null) {
				return { ok: false, error: "Use um número válido." } as const;
			}
			numericValue = parsed;
			value = rawValue.replace(",", ".").trim();
		}

		upsertGuess(store, {
			poolId,
			userId: user.id,
			value,
			numericValue,
		});
		saveApostasStore(store);

		return { ok: true, message: "Palpite salvo." } as const;
	}

	if (intent === "close") {
		const userId = await requireAuthUserId(request);
		if (userId !== pool.ownerId) {
			return { ok: false, error: "Somente o dono pode fechar a pool." } as const;
		}

		if (pool.status === "closed") {
			return { ok: false, error: "Pool já está fechada." } as const;
		}

		const guesses = getGuessesByPool(store, poolId);
		let winnerGuess = null as (typeof guesses)[number] | null;

		if (pool.type === "number") {
			const rawResult = getString(formData, "resultNumber");
			const resultNumber = parseNumber(rawResult);
			if (resultNumber === null) {
				return { ok: false, error: "Informe o resultado numérico." } as const;
			}
			pool.resultNumber = resultNumber;

			const numericGuesses = guesses.filter((guess) => typeof guess.numericValue === "number");
			if (numericGuesses.length > 0) {
				numericGuesses.sort((a, b) => {
					const diffA = Math.abs((a.numericValue ?? 0) - resultNumber);
					const diffB = Math.abs((b.numericValue ?? 0) - resultNumber);
					if (diffA !== diffB) return diffA - diffB;
					return a.createdAt - b.createdAt;
				});
				winnerGuess = numericGuesses[0];
			}
		}

		if (pool.type === "text") {
			if (guesses.length > 0) {
				const winnerId = getString(formData, "winnerGuessId");
				if (!winnerId) {
					return { ok: false, error: "Escolha o vencedor." } as const;
				}
				winnerGuess = guesses.find((guess) => guess.id === winnerId) ?? null;
				if (!winnerGuess) {
					return { ok: false, error: "Vencedor inválido." } as const;
				}
			}
		}

		pool.status = "closed";
		pool.closedAt = Date.now();
		pool.winnerGuessId = winnerGuess ? winnerGuess.id : null;
		pool.winnerUserId = winnerGuess ? winnerGuess.userId : null;

		saveApostasStore(store);

		return {
			ok: true,
			message: winnerGuess
				? "Pool encerrada. Resultado definido."
				: "Pool encerrada sem vencedor.",
		} as const;
	}

	return { ok: false, error: "Ação inválida." } as const;
}

export default function ApostasPoolRoute() {
	return <ApostasPoolPage />;
}
