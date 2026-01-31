import { readFile } from "node:fs/promises";
import type { LoaderFunctionArgs } from "react-router";
import { getPoolById, loadApostasStore } from "../.server/apostasStore";

function contentTypeForExt(ext: string) {
	if (ext === "png") return "image/png";
	if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
	if (ext === "webp") return "image/webp";
	return "application/octet-stream";
}

export async function loader({ params }: LoaderFunctionArgs) {
	const poolId = params.poolId;
	if (!poolId) return new Response("Missing poolId", { status: 400 });

	const store = loadApostasStore();
	const pool = getPoolById(store, poolId);
	if (!pool || !pool.imagePath) return new Response("Not found", { status: 404 });

	const ext = pool.imagePath.split(".").pop()?.toLowerCase() ?? "png";
	const buffer = await readFile(pool.imagePath);
	return new Response(new Uint8Array(buffer), {
		headers: {
			"Content-Type": contentTypeForExt(ext),
			"Cache-Control": "public, max-age=300",
		},
	});
}
