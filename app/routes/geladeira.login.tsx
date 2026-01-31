import { redirect } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Táqui Tua Geladeira - Login" }];

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo") ?? "/geladeira/admin";
	return redirect(`/contas/login?redirectTo=${encodeURIComponent(redirectTo)}`);
}

export default function GeladeiraLoginRoute() {
	return null;
}
