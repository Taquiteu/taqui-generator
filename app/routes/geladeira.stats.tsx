import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { findAccountById, getGeladeiraAccess } from "../.server/accounts";
import { getStatsForOwner } from "../.server/geladeiraDb";
import { requireAuthUserId } from "../.server/authSession";
import { GeladeiraStatsPage } from "../features/geladeira/GeladeiraStatsPage";

export const meta: MetaFunction = () => [{ title: "Táqui Tua Geladeira - Stats" }];

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireAuthUserId(request);
	const user = findAccountById(userId);
	if (!user || !getGeladeiraAccess(user)) {
		return {
			user: { id: userId, displayName: userId },
			withdrawCount: 0,
			saleCount: 0,
			saleSumCents: 0,
		};
	}
	const stats = getStatsForOwner(user.id);
	return {
		user: { id: user.id, displayName: user.displayName },
		...stats,
	};
}

export default function GeladeiraStatsRoute() {
	return <GeladeiraStatsPage />;
}
