import type { MetaFunction } from "react-router";
import type { Link } from "../.server/Link";
import { makeLinkRepository } from "../.server/makeLinkRepository";
import { LinkPage, linkMeta } from "../features/link/LinkPage";
import type { Route } from "../+types/root";

export const meta: MetaFunction = linkMeta;

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	const originalUrl = formData.get("url");
	const contexto = formData.get("contexto");

	const urlText = typeof originalUrl === "string" ? originalUrl.trim() : "";
	if (urlText.length === 0) {
		return {
			error: "Adivinhação não é comigo. Cola a URL aí antes de clicar.",
			status: 422,
		};
	}

	let normalizedUrl: string;
	try {
		const candidate = urlText.includes("://") ? urlText : `https://${urlText}`;
		const parsedUrl = new URL(candidate);
		if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
			return { error: "Isso aí não abre nem a porta da esperança. Cola uma URL de verdade.", status: 400 };
		}
		normalizedUrl = parsedUrl.toString();
	} catch {
		return { error: "URL inválida. Confere e tenta de novo.", status: 400 };
	}

	const contextoText = typeof contexto === "string" ? contexto.trim() : "";
	if (contextoText.length === 0) {
		return { error: "Se você não passar o contexto, vai acabar recebendo o contexto...", status: 423 };
	}

	const shortUrl = Math.random().toString(36).substring(2, 8); // Gerador de URL curta

	const link: Link = {
		key: shortUrl,
		contexto: contextoText,
		url: normalizedUrl,
	};
	await makeLinkRepository().save(link);

	return { shortUrl: shortUrl };
};

export default function Index() {
	return <LinkPage />;
}
