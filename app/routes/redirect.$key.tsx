import type { Link } from "../.server/Link";
import { makeLinkRepository } from "../.server/makeLinkRepository";
import { RedirectLinkPage } from "../features/link/RedirectLinkPage";
import type { Route } from "../+types/root";

export async function loader({ params }: Route.LoaderArgs) {
	if (!params.key) {
		throw new Response("Bad Request: 'key' parameter is required.", {
			status: 400,
		});
	}

	try {
		const link = await makeLinkRepository().load(params.key);

		if (!link) {
			throw new Response("Not Found: Link does not exist.", { status: 404 });
		}

		return link;
	} catch (_) {
		throw new Response("Internal Server Error: Could not load the link.", {
			status: 500,
		});
	}
}

export default function RedirectLink() {
	return <RedirectLinkPage />;
}
