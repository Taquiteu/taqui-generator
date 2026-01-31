import { redirect, type MetaFunction } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
	findAccountById,
	isAdminUser,
	loadAccounts,
	saveAccounts,
	type AccountUser,
} from "../.server/accounts";
import { loadGeladeiraConfig } from "../.server/geladeiraConfig";
import {
	destroyAuthSession,
	getAuthSession,
	requireAuthUserId,
} from "../.server/authSession";
import { ContasAdminPage } from "../features/contas/ContasAdminPage";

export const meta: MetaFunction = () => [{ title: "Táqui Contas - Admin" }];

const ROOT_ADMIN_ID = "admin";

function newUserId() {
	return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getString(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, field: string) {
	return formData.get(field) === "on";
}

function getStringList(formData: FormData, field: string) {
	return formData
		.getAll(field)
		.filter((value): value is string => typeof value === "string" && value.length > 0);
}

function isUsernameTaken(users: AccountUser[], username: string, excludeId?: string) {
	const normalized = username.trim().toLowerCase();
	return users.some((user) => {
		if (excludeId && user.id === excludeId) return false;
		return user.username.toLowerCase() === normalized;
	});
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireAuthUserId(request);
	const current = findAccountById(userId);
	if (!current) {
		const session = await getAuthSession(request);
		throw redirect("/contas/login", {
			headers: { "Set-Cookie": await destroyAuthSession(session) },
		});
	}

	const isAdmin = isAdminUser(current);

	const accounts = loadAccounts();
	const fridges = loadGeladeiraConfig().fridges;

	return {
		currentUser: { id: current.id, displayName: current.displayName },
		isAdmin,
		fridges,
		users: (isAdmin ? accounts.users : accounts.users.filter((user) => user.id === current.id)).map(
			(user) => ({
				id: user.id,
				displayName: user.displayName,
				username: user.username,
				roles: user.roles,
				geladeira: user.apps.geladeira
					? {
							pixKey: user.apps.geladeira.pixKey,
							fridgeIds: user.apps.geladeira.fridgeIds,
						}
					: undefined,
			}),
		),
	};
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireAuthUserId(request);
	const current = findAccountById(userId);
	if (!current) return redirect("/contas/login");
	const isAdmin = isAdminUser(current);

	const formData = await request.formData();
	const intent = formData.get("intent");
	const validFridgeIds = new Set(loadGeladeiraConfig().fridges.map((fridge) => fridge.id));

	if (intent === "logout") {
		const session = await getAuthSession(request);
		return redirect("/", {
			headers: { "Set-Cookie": await destroyAuthSession(session) },
		});
	}

	const accounts = loadAccounts();

	if (!isAdmin && intent !== "update") {
		return { ok: false, error: "Sem permissão de admin." } as const;
	}

	if (intent === "create") {
		const displayName = getString(formData, "displayName");
		const username = getString(formData, "username");
		const password = getString(formData, "password");
		const roleAdmin = getBoolean(formData, "roleAdmin");
		const geladeiraEnabled = getBoolean(formData, "geladeiraEnabled");
		const geladeiraPixKey = getString(formData, "geladeiraPixKey");
		const geladeiraFridgeIds = getStringList(formData, "geladeiraFridgeIds").filter(
			(id) => validFridgeIds.has(id),
		);

		if (!displayName || !username || !password) {
			return { ok: false, error: "Nome, usuário e senha são obrigatórios." } as const;
		}

		if (isUsernameTaken(accounts.users, username)) {
			return { ok: false, error: "Usuário já existe." } as const;
		}

		if (geladeiraEnabled && geladeiraFridgeIds.length === 0) {
			return { ok: false, error: "Selecione ao menos uma geladeira." } as const;
		}

		const newUser: AccountUser = {
			id: newUserId(),
			displayName,
			username,
			password,
			roles: roleAdmin ? ["admin"] : [],
			apps: {},
		};

		if (geladeiraEnabled) {
			newUser.apps.geladeira = {
				pixKey: geladeiraPixKey,
				fridgeIds: geladeiraFridgeIds,
			};
		}

		accounts.users.push(newUser);
		saveAccounts(accounts);
		return { ok: true, message: "Usuário criado." } as const;
	}

	if (intent === "update") {
		const targetId = getString(formData, "userId");
		const displayName = getString(formData, "displayName");
		const password = getString(formData, "password");
		const roleAdmin = getBoolean(formData, "roleAdmin");
		const roleAdminWasSent = formData.has("roleAdmin");
		const geladeiraEnabled = getBoolean(formData, "geladeiraEnabled");
		const geladeiraPixKey = getString(formData, "geladeiraPixKey");
		const geladeiraFridgeIds = getStringList(formData, "geladeiraFridgeIds").filter(
			(id) => validFridgeIds.has(id),
		);

		const user = accounts.users.find((entry) => entry.id === targetId);
		if (!user) {
			return { ok: false, error: "Usuário não encontrado." } as const;
		}

		if (targetId === ROOT_ADMIN_ID && current.id !== ROOT_ADMIN_ID) {
			return { ok: false, error: "Conta admin é protegida." } as const;
		}

		if (!isAdmin && user.id !== current.id) {
			return { ok: false, error: "Você só pode editar sua conta." } as const;
		}

		if (!displayName) {
			return { ok: false, error: "Nome é obrigatório." } as const;
		}

		user.displayName = displayName;
		if (password) user.password = password;

		const effectiveRoleAdmin =
			targetId === ROOT_ADMIN_ID
				? true
				: roleAdminWasSent
					? roleAdmin
					: user.roles.includes("admin");

		if (isAdmin) {
			if (targetId === ROOT_ADMIN_ID && roleAdminWasSent && !roleAdmin) {
				return {
					ok: false,
					error: "Conta admin não pode perder permissão de admin.",
				} as const;
			}
			if (geladeiraEnabled && geladeiraFridgeIds.length === 0) {
				return { ok: false, error: "Selecione ao menos uma geladeira." } as const;
			}

			user.roles = effectiveRoleAdmin ? ["admin"] : [];

			const apps = { ...user.apps };
			if (geladeiraEnabled) {
				const previousPix = user.apps.geladeira?.pixKey ?? "";
				apps.geladeira = {
					pixKey: geladeiraPixKey.length > 0 ? geladeiraPixKey : previousPix,
					fridgeIds: geladeiraFridgeIds,
				};
			} else {
				delete apps.geladeira;
			}
			user.apps = apps;
		} else if (user.apps.geladeira) {
			const previousPix = user.apps.geladeira.pixKey;
			user.apps = {
				...user.apps,
				geladeira: {
					...user.apps.geladeira,
					pixKey: geladeiraPixKey.length > 0 ? geladeiraPixKey : previousPix,
				},
			};
		}

		saveAccounts(accounts);
		return { ok: true, message: "Usuário atualizado." } as const;
	}

	if (intent === "delete") {
		const targetId = getString(formData, "userId");
		if (!targetId) return { ok: false, error: "Usuário inválido." } as const;
		if (targetId === ROOT_ADMIN_ID) {
			return { ok: false, error: "Conta admin não pode ser removida." } as const;
		}
		if (targetId === current.id) {
			return { ok: false, error: "Você não pode remover a si mesmo." } as const;
		}

		const next = accounts.users.filter((entry) => entry.id !== targetId);
		if (next.length === accounts.users.length) {
			return { ok: false, error: "Usuário não encontrado." } as const;
		}
		accounts.users = next;
		saveAccounts(accounts);
		return { ok: true, message: "Usuário removido." } as const;
	}

	return { ok: false, error: "Ação inválida." } as const;
}

export default function ContasAdminRoute() {
	return <ContasAdminPage />;
}
