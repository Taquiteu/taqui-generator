import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { findAccountById } from "../.server/accounts";
import {
	getPoolImagePath,
	getImagesDir,
	loadApostasStore,
	newPoolId,
	saveApostasStore,
} from "../.server/apostasStore";
import type { PoolType, PoolVisibility } from "../.server/apostasStore";
import { destroyAuthSession, getAuthSession, requireAuthUserId } from "../.server/authSession";
import { ApostasCreatePage } from "../features/apostas/ApostasCreatePage";

export const meta: MetaFunction = () => [{ title: "Táqui Apostas - Criar" }];

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true });
}

function getString(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: string) {
	const [datePart, timePart] = value.split("T");
	if (!datePart || !timePart) return null;
	const [year, month, day] = datePart.split("-").map((part) => Number(part));
	const [hourRaw, minuteRaw] = timePart.split(":");
	const hour = Number(hourRaw);
	const minute = Number(minuteRaw);
	if (
		!Number.isFinite(year) ||
		!Number.isFinite(month) ||
		!Number.isFinite(day) ||
		!Number.isFinite(hour) ||
		!Number.isFinite(minute)
	) {
		return null;
	}
	const date = new Date(year, month - 1, day, hour, minute);
	const time = date.getTime();
	return Number.isFinite(time) ? time : null;
}

function getImageExt(file: File) {
	const type = file.type.toLowerCase();
	if (type === "image/png") return "png";
	if (type === "image/jpeg") return "jpg";
	if (type === "image/webp") return "webp";
	return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireAuthUserId(request);
	const user = findAccountById(userId);
	if (!user) {
		const session = await getAuthSession(request);
		throw redirect("/contas/login", {
			headers: { "Set-Cookie": await destroyAuthSession(session) },
		});
	}

	const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
	const tzOffset = defaultDate.getTimezoneOffset() * 60000;
	const defaultCloseAt = new Date(defaultDate.getTime() - tzOffset)
		.toISOString()
		.slice(0, 16);

	return {
		user: { id: user.id, displayName: user.displayName },
		defaultCloseAt,
	};
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireAuthUserId(request);
	const user = findAccountById(userId);
	if (!user) {
		const session = await getAuthSession(request);
		throw redirect("/contas/login", {
			headers: { "Set-Cookie": await destroyAuthSession(session) },
		});
	}

	const formData = await request.formData();
	const name = getString(formData, "name");
	const description = getString(formData, "description");
	const type = getString(formData, "type") as PoolType;
	const visibility = getString(formData, "visibility") as PoolVisibility;
	const closesAtRaw = getString(formData, "closesAt");

	if (!name || !description || !closesAtRaw) {
		return { ok: false, error: "Nome, descrição e data são obrigatórios." } as const;
	}

	if (type !== "number" && type !== "text") {
		return { ok: false, error: "Tipo de pool inválido." } as const;
	}

	if (visibility !== "public" && visibility !== "private") {
		return { ok: false, error: "Visibilidade inválida." } as const;
	}

	const closesAt = parseDate(closesAtRaw);
	if (!closesAt) {
		return { ok: false, error: "Data de fechamento inválida." } as const;
	}

	const poolId = newPoolId();
	let imagePath: string | null = null;
	const image = formData.get("image");
	if (image instanceof File && image.size > 0) {
		const ext = getImageExt(image);
		if (!ext) {
			return { ok: false, error: "Imagem inválida. Use PNG, JPG ou WebP." } as const;
		}
		const dir = getImagesDir();
		ensureDir(dir);
		imagePath = getPoolImagePath(poolId, ext);
		const buffer = Buffer.from(await image.arrayBuffer());
		await writeFile(imagePath, buffer);
	}

	const store = loadApostasStore();
	store.pools.push({
		id: poolId,
		name,
		description,
		type,
		visibility,
		ownerId: user.id,
		createdAt: Date.now(),
		closesAt,
		status: "open",
		imagePath,
		resultNumber: null,
		winnerGuessId: null,
		winnerUserId: null,
		closedAt: null,
	});
	saveApostasStore(store);

	return redirect(`/apostas/pool/${poolId}`);
}

export default function ApostasCriarRoute() {
	return <ApostasCreatePage />;
}
