import { readFileSync } from "node:fs";

export type GeladeiraConfig = {
	fridges: Array<{ id: string; name: string }>;
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

let cachedConfig: GeladeiraConfig | null = null;

export function loadGeladeiraConfig(): GeladeiraConfig {
	const shouldCache = process.env.NODE_ENV === "production";
	if (shouldCache && cachedConfig) return cachedConfig;

	const configPath =
		process.env.GELADEIRA_CONFIG_PATH ??
		process.env.FRIDGE_CONFIG_PATH ??
		"./config/geladeira.json";

	let raw: string;
	try {
		raw = readFileSync(configPath, "utf8");
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			raw = readFileSync("./config/geladeira.example.json", "utf8");
		} else {
			throw new Error(
				`Config da geladeira não encontrada em "${configPath}". Crie o arquivo (base: config/geladeira.example.json) e configure GELADEIRA_CONFIG_PATH.`,
			);
		}
	}

	const parsed = JSON.parse(raw) as unknown;
	if (!isRecord(parsed)) throw new Error("Config da geladeira inválida.");

	const fridgesRaw = parsed.fridges;
	if (!Array.isArray(fridgesRaw)) {
		throw new Error('Config da geladeira precisa ter "fridges".');
	}

	const fridges = fridgesRaw.map((entry, index) => {
		if (!isRecord(entry)) throw new Error(`Fridge[${index}] inválida.`);
		return {
			id: expectString(entry.id, `fridges[${index}].id`),
			name: expectString(entry.name, `fridges[${index}].name`),
		};
	});

	if (fridges.length === 0) throw new Error("Config da geladeira sem fridges.");

	const config = { fridges };
	if (shouldCache) cachedConfig = config;
	return config;
}
