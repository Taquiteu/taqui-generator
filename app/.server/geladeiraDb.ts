import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type GeladeiraItem = {
	id: string;
	fridgeId: string;
	ownerId: string;
	name: string;
	quantity: number;
	forSale: boolean;
	priceCents: number | null;
	imagePath: string | null;
	createdAt: number;
	updatedAt: number;
};

export type GeladeiraEvent = {
	id: number;
	kind: "withdraw" | "sale";
	fridgeId: string;
	itemId: string;
	ownerId: string;
	priceCents: number | null;
	createdAt: number;
};

type GeladeiraStore = {
	fridges: Array<{ id: string; name: string }>;
	items: GeladeiraItem[];
	events: GeladeiraEvent[];
	nextEventId: number;
};

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true });
}

function getStorePath() {
	return (
		process.env.GELADEIRA_DB_PATH ??
		process.env.FRIDGE_DB_PATH ??
		"./data/geladeira/geladeira.json"
	);
}

function emptyStore(): GeladeiraStore {
	return { fridges: [], items: [], events: [], nextEventId: 1 };
}

function normalizeStore(raw: any): GeladeiraStore {
	const fridges = Array.isArray(raw?.fridges) ? raw.fridges : [];
	const items = Array.isArray(raw?.items) ? raw.items : [];
	const events = Array.isArray(raw?.events) ? raw.events : [];
	let nextEventId = Number(raw?.nextEventId);
	if (!Number.isFinite(nextEventId) || nextEventId <= 0) {
		const maxId = events.reduce((max: number, event: { id: any; }) => {
			const id = Number(event?.id ?? 0);
			return id > max ? id : max;
		}, 0);
		nextEventId = maxId + 1;
		if (nextEventId <= 0) nextEventId = 1;
	}

	return { fridges, items, events, nextEventId };
}

function readStore(): GeladeiraStore {
	const path = getStorePath();
	ensureDir(dirname(path));
	try {
		const data = readFileSync(path, "utf8");
		return normalizeStore(JSON.parse(data));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return emptyStore();
		}
		throw error;
	}
}

function writeStore(store: GeladeiraStore) {
	const path = getStorePath();
	ensureDir(dirname(path));
	writeFileSync(path, JSON.stringify(store, null, 2), "utf8");
}

function normalizeItem(item: GeladeiraItem): GeladeiraItem {
	return {
		...item,
		forSale: Boolean(item.forSale),
		priceCents: item.priceCents == null ? null : Number(item.priceCents),
		quantity: Number(item.quantity),
		createdAt: Number(item.createdAt),
		updatedAt: Number(item.updatedAt),
	};
}

export function upsertFridges(fridges: Array<{ id: string; name: string }>) {
	const store = readStore();
	const merged = new Map(store.fridges.map((fridge) => [fridge.id, fridge]));
	fridges.forEach((fridge) => {
		merged.set(fridge.id, { id: fridge.id, name: fridge.name });
	});
	store.fridges = Array.from(merged.values());
	writeStore(store);
}

export function listFridges(): Array<{ id: string; name: string }> {
	const store = readStore();
	return [...store.fridges].sort((a, b) => a.name.localeCompare(b.name));
}

export function listItemsByFridge(fridgeId: string): GeladeiraItem[] {
	const store = readStore();
	return store.items
		.filter((item) => item.fridgeId === fridgeId && item.quantity > 0)
		.map((item) => normalizeItem(item))
		.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function listItemsByOwner(fridgeId: string, ownerId: string): GeladeiraItem[] {
	const store = readStore();
	return store.items
		.filter((item) => item.fridgeId === fridgeId && item.ownerId === ownerId)
		.map((item) => normalizeItem(item))
		.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getItemById(itemId: string): GeladeiraItem | null {
	const store = readStore();
	const item = store.items.find((entry) => entry.id === itemId);
	return item ? normalizeItem(item) : null;
}

export function insertItem(item: Omit<GeladeiraItem, "createdAt" | "updatedAt">) {
	const store = readStore();
	const now = Date.now();
	store.items.push({
		...item,
		createdAt: now,
		updatedAt: now,
	});
	writeStore(store);
}

export function updateItem(item: Pick<GeladeiraItem, "id" | "ownerId" | "name" | "quantity" | "forSale" | "priceCents" | "imagePath">) {
	const store = readStore();
	const target = store.items.find(
		(entry) => entry.id === item.id && entry.ownerId === item.ownerId,
	);
	if (!target) return;
	const now = Date.now();
	target.name = item.name;
	target.quantity = item.quantity;
	target.forSale = item.forSale;
	target.priceCents = item.priceCents;
	target.imagePath = item.imagePath;
	target.updatedAt = now;
	writeStore(store);
}

export function deleteItem(itemId: string, ownerId: string) {
	const store = readStore();
	const nextItems = store.items.filter(
		(entry) => !(entry.id === itemId && entry.ownerId === ownerId),
	);
	if (nextItems.length === store.items.length) return;
	store.items = nextItems;
	writeStore(store);
}

export function withdrawOne(itemId: string): { ok: true; item: GeladeiraItem } | { ok: false; error: string } {
	const item = getItemById(itemId);
	if (!item) return { ok: false, error: "Item não encontrado." };
	if (item.quantity <= 0) return { ok: false, error: "Esse item já acabou." };

	const store = readStore();
	const target = store.items.find((entry) => entry.id === itemId);
	if (!target) return { ok: false, error: "Item não encontrado." };

	const nextQty = item.quantity - 1;
	const now = Date.now();
	target.quantity = nextQty;
	target.updatedAt = now;

	const kind: GeladeiraEvent["kind"] = item.forSale ? "sale" : "withdraw";
	store.events.push({
		id: store.nextEventId,
		kind,
		fridgeId: item.fridgeId,
		itemId: item.id,
		ownerId: item.ownerId,
		priceCents: item.forSale ? item.priceCents : null,
		createdAt: now,
	});
	store.nextEventId += 1;
	writeStore(store);

	return { ok: true, item: { ...item, quantity: nextQty, updatedAt: now } };
}

export function getStatsForOwner(ownerId: string) {
	const store = readStore();

	let withdrawCount = 0;
	let saleCount = 0;
	let saleSumCents = 0;

	store.events.forEach((event) => {
		if (event.ownerId !== ownerId) return;
		if (event.kind === "withdraw") {
			withdrawCount += 1;
		}
		if (event.kind === "sale") {
			saleCount += 1;
			saleSumCents += Number(event.priceCents ?? 0);
		}
	});

	return { withdrawCount, saleCount, saleSumCents };
}
