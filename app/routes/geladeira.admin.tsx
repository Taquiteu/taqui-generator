import { mkdirSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { redirect, type MetaFunction } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { findAccountById, getGeladeiraAccess } from "../.server/accounts";
import { loadGeladeiraConfig } from "../.server/geladeiraConfig";
import {
	deleteItem,
	getItemById,
	insertItem,
	listItemsByOwner,
	updateItem,
	upsertFridges,
} from "../.server/geladeiraDb";
import {
	deletePixQrForUser,
	hasPixQrForUser,
	getPixQrCacheKeyForUser,
	savePixQrForUser,
} from "../.server/geladeiraPixQr";
import {
	destroyAuthSession,
	getAuthSession,
	requireAuthUserId,
} from "../.server/authSession";
import { GeladeiraAdminPage } from "../features/geladeira/GeladeiraAdminPage";

export const meta: MetaFunction = () => [{ title: "Táqui Tua Geladeira - Admin" }];

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true });
}

function parseIntSafe(value: unknown, fallback: number) {
	const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
	return Number.isFinite(n) ? n : fallback;
}

function parsePriceCents(value: unknown) {
	if (typeof value !== "string") return null;
	const normalized = value.replace(",", ".").trim();
	if (normalized.length === 0) return null;
	const number = Number(normalized);
	if (!Number.isFinite(number)) return null;
	const cents = Math.round(number * 100);
	return cents >= 0 ? cents : null;
}

function getImageExt(file: File) {
	const type = file.type.toLowerCase();
	if (type === "image/png") return "png";
	if (type === "image/jpeg") return "jpg";
	if (type === "image/webp") return "webp";
	return null;
}

function newId(prefix: string) {
	return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireAuthUserId(request);
	const config = loadGeladeiraConfig();
	upsertFridges(config.fridges);

	const user = findAccountById(userId);
	if (!user) {
		const session = await getAuthSession(request);
		throw redirect("/contas/login", {
			headers: { "Set-Cookie": await destroyAuthSession(session) },
		});
	}

	const geladeiraAccess = getGeladeiraAccess(user);
	if (!geladeiraAccess) {
		const url = new URL(request.url);
		const returnTo = `${url.pathname}${url.search}`;
		throw redirect(`/contas/login?redirectTo=${encodeURIComponent(returnTo)}`);
	}

	const allowedFridges = config.fridges.filter((fridge) =>
		geladeiraAccess.fridgeIds.includes(fridge.id),
	);
	if (allowedFridges.length === 0) {
		throw new Error(
			`Usuário "${user.id}" não tem acesso a nenhuma geladeira. Verifique o cadastro de contas.`,
		);
	}
	const url = new URL(request.url);
	const fridgeParam = url.searchParams.get("fridge");
	const selectedFridgeId =
		fridgeParam && allowedFridges.some((fridge) => fridge.id === fridgeParam)
			? fridgeParam
			: allowedFridges[0].id;

	const items = listItemsByOwner(selectedFridgeId, user.id).map((item) => ({
		id: item.id,
		name: item.name,
		quantity: item.quantity,
		forSale: item.forSale,
		priceCents: item.priceCents,
		hasImage: Boolean(item.imagePath),
	}));

	return {
		user: {
			id: user.id,
			displayName: user.displayName,
			pixKey: geladeiraAccess.pixKey,
			hasPixQr: hasPixQrForUser(user.id),
			pixQrVersion: getPixQrCacheKeyForUser(user.id),
		},
		fridges: allowedFridges,
		selectedFridgeId,
		items,
	};
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireAuthUserId(request);
	const user = findAccountById(userId);
	if (!user) return redirect("/contas/login");

	const geladeiraAccess = getGeladeiraAccess(user);
	if (!geladeiraAccess) {
		const url = new URL(request.url);
		const returnTo = `${url.pathname}${url.search}`;
		return redirect(`/contas/login?redirectTo=${encodeURIComponent(returnTo)}`);
	}

	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "logout") {
		const session = await getAuthSession(request);
		return redirect("/geladeira", {
			headers: { "Set-Cookie": await destroyAuthSession(session) },
		});
	}

	if (intent === "pixQrUpload") {
		const pixQr = formData.get("pixQr");
		if (!(pixQr instanceof File) || pixQr.size === 0) {
			return { ok: false, error: "Envie uma imagem do QR do Pix." } as const;
		}
		try {
			await savePixQrForUser(user.id, pixQr);
			return { ok: true, message: "QR do Pix atualizado." } as const;
		} catch (error) {
			return {
				ok: false,
				error: error instanceof Error ? error.message : "Não foi possível salvar o QR do Pix.",
			} as const;
		}
	}

	if (intent === "pixQrDelete") {
		await deletePixQrForUser(user.id);
		return { ok: true, message: "QR do Pix removido." } as const;
	}

	if (intent === "add") {
		const fridgeId = formData.get("fridgeId");
		if (typeof fridgeId !== "string" || !geladeiraAccess.fridgeIds.includes(fridgeId)) {
			return { ok: false, error: "Geladeira inválida." } as const;
		}

		const name = typeof formData.get("name") === "string" ? formData.get("name")!.toString().trim() : "";
		if (name.length === 0) return { ok: false, error: "Nome do item obrigatório." } as const;

		const quantity = Math.max(1, parseIntSafe(formData.get("quantity"), 1));
		const forSale = formData.get("forSale") === "on";
		const priceCents = forSale ? parsePriceCents(formData.get("price")) : null;
		if (forSale && (priceCents == null || priceCents <= 0)) {
			return { ok: false, error: "Preço obrigatório para item à venda." } as const;
		}

		const itemId = newId("item");
		let imagePath: string | null = null;

		const image = formData.get("image");
		if (image instanceof File && image.size > 0) {
			const ext = getImageExt(image);
			if (ext) {
				const dir = "./data/geladeira/images";
				ensureDir(dir);
				imagePath = join(dir, `${itemId}.${ext}`);
				const buffer = Buffer.from(await image.arrayBuffer());
				await writeFile(imagePath, buffer);
			}
		}

		insertItem({
			id: itemId,
			fridgeId,
			ownerId: user.id,
			name,
			quantity,
			forSale,
			priceCents,
			imagePath,
		});

		return { ok: true, message: "Item adicionado." } as const;
	}

	if (intent === "update") {
		const itemId = formData.get("itemId");
		if (typeof itemId !== "string" || itemId.length === 0) {
			return { ok: false, error: "Item inválido." } as const;
		}

		const current = getItemById(itemId);
		if (!current || current.ownerId !== user.id) {
			return { ok: false, error: "Você não pode editar esse item." } as const;
		}

		const quantity = Math.max(0, parseIntSafe(formData.get("quantity"), current.quantity));
		const forSale = formData.get("forSale") === "on";
		const priceCents = forSale ? parsePriceCents(formData.get("price")) : null;
		if (forSale && (priceCents == null || priceCents <= 0)) {
			return { ok: false, error: "Preço obrigatório para item à venda." } as const;
		}

		updateItem({
			id: current.id,
			ownerId: user.id,
			name: current.name,
			quantity,
			forSale,
			priceCents,
			imagePath: current.imagePath,
		});

		return { ok: true, message: "Item atualizado." } as const;
	}

	if (intent === "delete") {
		const itemId = formData.get("itemId");
		if (typeof itemId !== "string" || itemId.length === 0) {
			return { ok: false, error: "Item inválido." } as const;
		}

		const current = getItemById(itemId);
		if (!current || current.ownerId !== user.id) {
			return { ok: false, error: "Você não pode remover esse item." } as const;
		}

		deleteItem(itemId, user.id);
		if (current.imagePath) {
			try {
				await unlink(current.imagePath);
			} catch {
				// ignore
			}
		}
		return { ok: true, message: "Item removido." } as const;
	}

	return { ok: false, error: "Ação inválida." } as const;
}

export default function GeladeiraAdminRoute() {
	return <GeladeiraAdminPage />;
}
