import { CalendarBlankIcon, ImageSquareIcon, PlusIcon } from "@phosphor-icons/react";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import { PageShell } from "../../components/PageShell";

type LoaderData = {
	user: { id: string; displayName: string };
	defaultCloseAt: string;
};

type ActionData = { ok: false; error: string } | { ok: true };

export function ApostasCreatePage() {
	const data = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData | undefined;

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center">
				<div className="w-full max-w-[720px] rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-4">
							<div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000]">
								<PlusIcon className="h-7 w-7 text-black" weight="bold" />
							</div>
							<div>
								<p className="text-2xl font-bold leading-8">Criar pool</p>
								<p className="text-sm leading-5 text-black/70">
									Quem vai chegar mais perto? Você decide as regras.
								</p>
							</div>
						</div>
						<p className="text-sm font-bold text-black/70">
							Logado como {data.user.displayName}
						</p>
					</div>

					{actionData && "ok" in actionData && !actionData.ok && (
						<div className="mt-4 rounded-lg border-2 border-black bg-[#FF4D4D] p-3 font-bold shadow-[2px_2px_0_#000000]">
							{actionData.error}
						</div>
					)}

					<Form method="post" encType="multipart/form-data" className="mt-6 flex flex-col gap-4">
						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Nome da pool</span>
							<input
								name="name"
								type="text"
								placeholder="Ex: Oscar, Final do BBB..."
								className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								required
							/>
						</label>

						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Descrição</span>
							<textarea
								name="description"
								placeholder="Contexto rápido do que está em jogo."
								rows={3}
								className="w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-base font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								required
							/>
						</label>

						<div className="grid gap-4 sm:grid-cols-2">
							<label className="flex flex-col gap-2">
								<span className="text-sm font-bold">Tipo de palpite</span>
								<select
									name="type"
									defaultValue="number"
									className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								>
									<option value="number">Número</option>
									<option value="text">Texto</option>
								</select>
							</label>

							<label className="flex flex-col gap-2">
								<span className="text-sm font-bold">Visibilidade</span>
								<select
									name="visibility"
									defaultValue="public"
									className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								>
									<option value="public">Pública (aparece na lista)</option>
									<option value="private">Privada (somente com link)</option>
								</select>
							</label>
						</div>

						<label className="flex flex-col gap-2">
							<span className="flex items-center gap-2 text-sm font-bold">
								<CalendarBlankIcon className="h-4 w-4" weight="bold" />
								Data de fechamento
							</span>
							<input
								name="closesAt"
								type="datetime-local"
								defaultValue={data.defaultCloseAt}
								className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								required
							/>
						</label>

						<label className="flex flex-col gap-2">
							<span className="flex items-center gap-2 text-sm font-bold">
								<ImageSquareIcon className="h-4 w-4" weight="bold" />
								Imagem (opcional)
							</span>
							<input
								name="image"
								type="file"
								accept="image/png,image/jpeg,image/webp"
								className="w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-sm font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
							/>
						</label>

						<button
							type="submit"
							className="mt-2 flex h-[56px] w-full items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
						>
							Criar pool
						</button>

						<Link to="/apostas" className="text-center text-sm font-bold underline">
							Voltar para pools
						</Link>
					</Form>
				</div>
			</div>
		</PageShell>
	);
}
