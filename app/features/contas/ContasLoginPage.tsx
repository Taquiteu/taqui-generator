import { LockKeyIcon } from "@phosphor-icons/react";
import { Form, Link, useActionData, useSearchParams } from "react-router";
import { PageShell } from "../../components/PageShell";

type ActionData = { ok: false; error: string } | { ok: true };

export function ContasLoginPage() {
	const actionData = useActionData() as ActionData | undefined;
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") ?? "/contas/admin";

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center">
				<div className="w-full max-w-[520px] rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000]">
							<LockKeyIcon className="h-7 w-7 text-black" weight="bold" />
						</div>
						<div>
							<p className="text-2xl font-bold leading-8">Login</p>
							<p className="text-sm leading-5 text-black/70">
								Entre para acessar apps privados.
							</p>
						</div>
					</div>

					{actionData && "ok" in actionData && !actionData.ok && (
						<div className="mt-4 rounded-lg border-2 border-black bg-[#FF4D4D] p-3 font-bold shadow-[2px_2px_0_#000000]">
							{actionData.error}
						</div>
					)}

					<Form method="post" className="mt-6 flex flex-col gap-4">
						<input type="hidden" name="redirectTo" value={redirectTo} />

						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Usuário</span>
							<input
								name="username"
								type="text"
								autoComplete="username"
								className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
							/>
						</label>

						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Senha</span>
							<input
								name="password"
								type="password"
								autoComplete="current-password"
								className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
							/>
						</label>

						<button
							type="submit"
							className="mt-2 flex h-[56px] w-full items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
						>
							Entrar
						</button>

						<div className="flex flex-col gap-2 text-center text-sm font-bold">
							<Link to="/contas/criar" className="underline">
								Criar conta
							</Link>
							<Link to="/" className="underline">
								Voltar pro hub
							</Link>
						</div>
					</Form>
				</div>
			</div>
		</PageShell>
	);
}
