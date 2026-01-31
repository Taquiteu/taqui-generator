import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type PoolType = "number" | "text";
export type PoolVisibility = "public" | "private";
export type PoolStatus = "open" | "closed";

export type Pool = {
	id: string;
	name: string;
	description: string;
	type: PoolType;
	visibility: PoolVisibility;
	ownerId: string;
	createdAt: number;
	closesAt: number;
	status: PoolStatus;
	imagePath: string | null;
	resultNumber?: number | null;
	winnerGuessId?: string | null;
	winnerUserId?: string | null;
	closedAt?: number | null;
};

export type Guess = {
	id: string;
	poolId: string;
	userId: string;
	value: string;
	numericValue: number | null;
	createdAt: number;
	updatedAt: number;
};

export type ApostasStore = {
	pools: Pool[];
	guesses: Guess[];
};

function getStorePath() {
	return process.env.APOSTAS_STORE_PATH ?? "./data/apostas/pools.json";
}

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true });
}

export function loadApostasStore(): ApostasStore {
	const path = getStorePath();
	if (!existsSync(path)) return { pools: [], guesses: [] };
	const raw = readFileSync(path, "utf8");
	const parsed = JSON.parse(raw) as ApostasStore;
	return {
		pools: Array.isArray(parsed.pools) ? parsed.pools : [],
		guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
	};
}

export function saveApostasStore(store: ApostasStore) {
	const path = getStorePath();
	ensureDir(dirname(path));
	writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export function newPoolId() {
	return `pool_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newGuessId() {
	return `guess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getPoolById(store: ApostasStore, poolId: string) {
	return store.pools.find((pool) => pool.id === poolId) ?? null;
}

export function getGuessesByPool(store: ApostasStore, poolId: string) {
	return store.guesses.filter((guess) => guess.poolId === poolId);
}

export function getGuessByUser(store: ApostasStore, poolId: string, userId: string) {
	return store.guesses.find((guess) => guess.poolId === poolId && guess.userId === userId) ?? null;
}

export function upsertGuess(store: ApostasStore, data: Omit<Guess, "id" | "createdAt" | "updatedAt">) {
	const existing = getGuessByUser(store, data.poolId, data.userId);
	const now = Date.now();
	if (existing) {
		existing.value = data.value;
		existing.numericValue = data.numericValue;
		existing.updatedAt = now;
		return existing;
	}

	const guess: Guess = {
		id: newGuessId(),
		createdAt: now,
		updatedAt: now,
		...data,
	};
	store.guesses.push(guess);
	return guess;
}

export function getPoolImagePath(poolId: string, ext: string) {
	return join(getImagesDir(), `${poolId}.${ext}`);
}

export function getImagesDir() {
	return process.env.APOSTAS_IMAGE_DIR ?? "./data/apostas/images";
}
