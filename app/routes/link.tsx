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

	if (!originalUrl) {
		return { error: "URL é obrigatória", status: 400 };
	}

	if (!contexto) {
		return { error: "Contexto é obrigatório", status: 400 };
	}

	const shortUrl = Math.random().toString(36).substring(2, 8); // Gerador de URL curta

	const link: Link = {
		key: shortUrl,
		contexto: contexto.toString(),
		url: originalUrl.toString(),
	};
	makeLinkRepository().save(link);

	return { shortUrl: shortUrl };
};

export default function Index() {
	return <LinkPage />;
}
