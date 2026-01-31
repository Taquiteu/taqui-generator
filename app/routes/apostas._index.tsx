import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { ApostasPage } from "../features/apostas/ApostasPage";
import { loadApostasStore } from "../.server/apostasStore";
import { loadAccounts } from "../.server/accounts";
import { getAuthSession } from "../.server/authSession";

export const meta: MetaFunction = () => [
	{ title: "Táqui Apostas" },
	{
		name: "description",
		content: "Crie pools, participe e veja quem chega mais perto.",
	},
];

export async function loader({ request }: LoaderFunctionArgs) {
	const store = loadApostasStore();
	const accounts = loadAccounts();
	const userMap = new Map(accounts.users.map((user) => [user.id, user.displayName]));

	const session = await getAuthSession(request);
	const userId = session.get("userId");
	const currentUser =
		typeof userId === "string"
			? accounts.users.find((user) => user.id === userId) ?? null
			: null;

	const toCard = (pool: (typeof store)["pools"][number]) => ({
		id: pool.id,
		name: pool.name,
		description: pool.description,
		type: pool.type,
		visibility: pool.visibility,
		status: pool.status,
		closesAt: pool.closesAt,
		ownerName: userMap.get(pool.ownerId) ?? pool.ownerId,
		hasImage: Boolean(pool.imagePath),
	});

	const publicPools = store.pools
		.filter((pool) => pool.visibility === "public")
		.sort((a, b) => a.closesAt - b.closesAt)
		.map(toCard);

	const myPools = currentUser
		? store.pools
				.filter((pool) => pool.ownerId === currentUser.id)
				.sort((a, b) => b.createdAt - a.createdAt)
				.map(toCard)
		: [];

	return {
		user: currentUser ? { id: currentUser.id, displayName: currentUser.displayName } : null,
		publicPools,
		myPools,
	};
}

export default function ApostasIndexRoute() {
	return <ApostasPage />;
}
