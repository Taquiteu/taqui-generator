import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type GeladeiraAccess = {
	pixKey: string;
	fridgeIds: string[];
};

export type AccountApps = {
	geladeira?: GeladeiraAccess;
	[key: string]: unknown;
};

export type AccountUser = {
	id: string;
	displayName: string;
	username: string;
	password: string;
	roles: string[];
	apps: AccountApps;
};

export type AccountsConfig = {
	users: AccountUser[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function expectString(value: unknown, field: string) {
	if (typeof value !== "string") throw new Error(`Campo "${field}" inválido.`);
	return value;
}

function expectStringArray(value: unknown, field: string) {
	if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
		throw new Error(`Campo "${field}" inválido.`);
	}
	return value as string[];
}

function getAccountsPath() {
	return process.env.TAQUI_ACCOUNTS_PATH ?? "./config/accounts.json";
}

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true });
}

export function loadAccounts(): AccountsConfig {
	const path = getAccountsPath();
	let raw: string;
	try {
		raw = readFileSync(path, "utf8");
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			raw = readFileSync("./config/accounts.example.json", "utf8");
		} else {
			throw new Error(
				`Config de contas não encontrada em "${path}". Crie o arquivo (base: config/accounts.example.json).`,
			);
		}
	}

	const parsed = JSON.parse(raw) as unknown;
	if (!isRecord(parsed)) throw new Error("Config de contas inválida.");

	const usersRaw = parsed.users;
	if (!Array.isArray(usersRaw)) throw new Error('Config de contas precisa de "users".');

	const users = usersRaw.map((entry, index) => {
		if (!isRecord(entry)) throw new Error(`User[${index}] inválido.`);

		const rolesRaw = isRecord(entry) ? entry.roles : [];
		const appsRaw = isRecord(entry) && isRecord(entry.apps) ? entry.apps : {};

		const roles =
			Array.isArray(rolesRaw) && rolesRaw.every((role) => typeof role === "string")
				? (rolesRaw as string[])
				: [];

		const apps: AccountApps = { ...(appsRaw as Record<string, unknown>) };
		const geladeira = appsRaw.geladeira;
		if (geladeira != null) {
			if (!isRecord(geladeira)) {
				throw new Error(`User[${index}].apps.geladeira inválido.`);
			}
			apps.geladeira = {
				pixKey: expectString(geladeira.pixKey, `users[${index}].apps.geladeira.pixKey`),
				fridgeIds: expectStringArray(
					geladeira.fridgeIds,
					`users[${index}].apps.geladeira.fridgeIds`,
				),
			};
		}

		return {
			id: expectString(entry.id, `users[${index}].id`),
			displayName: expectString(entry.displayName, `users[${index}].displayName`),
			username: expectString(entry.username, `users[${index}].username`),
			password: expectString(entry.password, `users[${index}].password`),
			roles,
			apps,
		};
	});

	if (users.length === 0) throw new Error("Config de contas sem users.");

	return { users };
}

export function saveAccounts(config: AccountsConfig) {
	const path = getAccountsPath();
	ensureDir(dirname(path));
	writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function findAccountByUsername(username: string) {
	const accounts = loadAccounts();
	const normalized = username.trim().toLowerCase();
	return accounts.users.find((user) => user.username.toLowerCase() === normalized) ?? null;
}

export function findAccountById(userId: string) {
	const accounts = loadAccounts();
	return accounts.users.find((user) => user.id === userId) ?? null;
}

export function isAdminUser(user: AccountUser) {
	return user.roles.includes("admin");
}

export function getGeladeiraAccess(user: AccountUser) {
	return user.apps.geladeira ?? null;
}

