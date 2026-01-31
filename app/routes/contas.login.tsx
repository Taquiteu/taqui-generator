import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { findAccountById, findAccountByUsername, getGeladeiraAccess, isAdminUser } from "../.server/accounts";
import { commitAuthSession, getAuthSession } from "../.server/authSession";
import { ContasLoginPage } from "../features/contas/ContasLoginPage";

export const meta: MetaFunction = () => [{ title: "Táqui Contas - Login" }];

function safeRedirect(to: string | null | undefined, fallback: string) {
	if (!to) return fallback;
	if (!to.startsWith("/")) return fallback;
	return to;
}

function canAccessRedirect(user: ReturnType<typeof findAccountById>, redirectTo: string) {
	if (!user) return false;
	if (redirectTo.startsWith("/contas/admin")) return isAdminUser(user);
	if (redirectTo.startsWith("/geladeira")) return Boolean(getGeladeiraAccess(user));
	return true;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getAuthSession(request);
	const userId = session.get("userId");
	const url = new URL(request.url);
	const redirectTo = safeRedirect(url.searchParams.get("redirectTo"), "/contas/admin");

	if (typeof userId === "string" && userId.length > 0) {
		const user = findAccountById(userId);
		if (canAccessRedirect(user, redirectTo)) {
			return redirect(redirectTo);
		}
	}
	return null;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const username = formData.get("username");
	const password = formData.get("password");
	const redirectTo = safeRedirect(formData.get("redirectTo")?.toString(), "/contas/admin");

	if (typeof username !== "string" || typeof password !== "string") {
		return { ok: false, error: "Preenche usuário e senha." } as const;
	}

	const user = findAccountByUsername(username);
	if (!user || user.password !== password) {
		return { ok: false, error: "Usuário ou senha inválidos." } as const;
	}

	const session = await getAuthSession(request);
	session.set("userId", user.id);

	return redirect(redirectTo, {
		headers: { "Set-Cookie": await commitAuthSession(session) },
	});
}

export default function ContasLoginRoute() {
	return <ContasLoginPage />;
}
