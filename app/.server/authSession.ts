import { createCookieSessionStorage, redirect } from "react-router";

type SessionData = {
	userId?: string;
};

const sessionSecret =
	process.env.SESSION_SECRET ??
	process.env.TAQUI_SESSION_SECRET ??
	"dev-session-secret";

export const authSessionStorage = createCookieSessionStorage<SessionData>({
	cookie: {
		name: "taqui_auth",
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		secrets: [sessionSecret],
		secure: process.env.TAQUI_COOKIE_SECURE === "true",
	},
});

export async function getAuthSession(request: Request) {
	const cookie = request.headers.get("Cookie");
	return authSessionStorage.getSession(cookie);
}

export async function requireAuthUserId(request: Request) {
	const session = await getAuthSession(request);
	const userId = session.get("userId");
	if (typeof userId !== "string" || userId.length === 0) {
		const url = new URL(request.url);
		const returnTo = `${url.pathname}${url.search}`;
		throw redirect(`/contas/login?redirectTo=${encodeURIComponent(returnTo)}`);
	}
	return userId;
}

export async function commitAuthSession(session: Awaited<ReturnType<typeof getAuthSession>>) {
	return authSessionStorage.commitSession(session);
}

export async function destroyAuthSession(session: Awaited<ReturnType<typeof getAuthSession>>) {
	return authSessionStorage.destroySession(session);
}
