import type { LoaderFunctionArgs } from "react-router";
import { findAccountById, getGeladeiraAccess } from "../.server/accounts";
import { findPixQrForUser, readPixQrBytes } from "../.server/geladeiraPixQr";

export async function loader({ params }: LoaderFunctionArgs) {
	const userId = params.userId;
	if (!userId) {
		return new Response("Missing userId", { status: 400 });
	}

	const user = findAccountById(userId);
	if (!user || !getGeladeiraAccess(user)) {
		return new Response("User not found", { status: 404 });
	}

	let file;
	try {
		file = findPixQrForUser(user.id);
	} catch {
		return new Response("Not found", { status: 404 });
	}

	if (!file) return new Response("Not found", { status: 404 });

	const bytes = await readPixQrBytes(file);
	return new Response(bytes, {
		headers: {
			"Content-Type": file.contentType,
			"Cache-Control": "public, max-age=60",
		},
	});
}
