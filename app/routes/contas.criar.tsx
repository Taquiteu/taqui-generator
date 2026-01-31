import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { findAccountByUsername, loadAccounts, saveAccounts } from "../.server/accounts";
import { commitAuthSession, getAuthSession } from "../.server/authSession";
import { ContasCreatePage } from "../features/contas/ContasCreatePage";

export const meta: MetaFunction = () => [{ title: "Táqui Contas - Criar" }];

function newUserId() {
	return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getString(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === "string" ? value.trim() : "";
}

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getAuthSession(request);
	const userId = session.get("userId");
	if (typeof userId === "string" && userId.length > 0) {
		return redirect("/contas/admin");
	}
	return null;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const displayName = getString(formData, "displayName");
	const username = getString(formData, "username");
	const password = getString(formData, "password");

	if (!displayName || !username || !password) {
		return { ok: false, error: "Nome, usuário e senha são obrigatórios." } as const;
	}

	if (findAccountByUsername(username)) {
		return { ok: false, error: "Usuário já existe." } as const;
	}

	const accounts = loadAccounts();
	const id = newUserId();
	accounts.users.push({
		id,
		displayName,
		username,
		password,
		roles: [],
		apps: {},
	});
	saveAccounts(accounts);

	const session = await getAuthSession(request);
	session.set("userId", id);

	return redirect("/contas/admin", {
		headers: { "Set-Cookie": await commitAuthSession(session) },
	});
}

export default function ContasCriarRoute() {
	return <ContasCreatePage />;
}
