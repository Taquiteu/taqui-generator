import { UserPlusIcon } from "@phosphor-icons/react";
import { Form, Link, useActionData } from "react-router";
import { PageShell } from "../../components/PageShell";

type ActionData = { ok: false; error: string } | { ok: true };

export function ContasCreatePage() {
	const actionData = useActionData() as ActionData | undefined;

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center">
				<div className="w-full max-w-[520px] rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-[#47B8FF] shadow-[2px_2px_0_#000000]">
							<UserPlusIcon className="h-7 w-7 text-black" weight="bold" />
						</div>
						<div>
							<p className="text-2xl font-bold leading-8">Criar conta</p>
							<p className="text-sm leading-5 text-black/70">
								Crie sua conta para acessar os apps privados.
							</p>
						</div>
					</div>

					{actionData && "ok" in actionData && !actionData.ok && (
						<div className="mt-4 rounded-lg border-2 border-black bg-[#FF4D4D] p-3 font-bold shadow-[2px_2px_0_#000000]">
							{actionData.error}
						</div>
					)}

					<Form method="post" className="mt-6 flex flex-col gap-4">
						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Nome</span>
							<input
								name="displayName"
								type="text"
								placeholder="Ex: Carla"
								className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
							/>
						</label>

						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Usuário</span>
							<input
								name="username"
								type="text"
								placeholder="Ex: carla"
								className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
							/>
						</label>

						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Senha</span>
							<input
								name="password"
								type="password"
								className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
							/>
						</label>

						<button
							type="submit"
							className="mt-2 flex h-[56px] w-full items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
						>
							Criar conta
						</button>

						<Link
							to="/contas/login"
							className="text-center text-sm font-bold underline"
						>
							Já tenho conta
						</Link>
					</Form>
				</div>
			</div>
		</PageShell>
	);
}
