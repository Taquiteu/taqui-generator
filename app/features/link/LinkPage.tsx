import { useState } from "react";
import { Form, useActionData } from "react-router";
import { GlassPanel } from "../../components/GlassPanel";
import { PageShell } from "../../components/PageShell";
import type { MetaFunction } from "react-router";

export type ActionData = {
	shortUrl?: string;
	originalUrl?: string;
	error?: string;
};

export const linkMeta: MetaFunction = () => {
	return [
		{ title: "Encurtador Táqui" },
		{
			name: "description",
			content: "Crie links curtos usando o backend do Táqui Generator.",
		},
	];
};

export function LinkPage() {
	const [text, setText] = useState("");
	const [link, setLink] = useState("");

	const actionData = useActionData<ActionData>();
	const origin =
		typeof window !== "undefined" ? window.location.origin : "https://taqui.app";
	const shortUrl = actionData?.shortUrl;

	return (
		<PageShell
			title="Encurtador de links"
			description="Gere um link curto que redireciona para onde você quiser."
		>
			<div className="grid w-full gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
				<GlassPanel tone="strong" className="text-left">
					<Form method="post" className="flex flex-col gap-4">
						<div className="space-y-1">
							<label className="text-xs font-bold uppercase text-white/90">
								Contexto
							</label>
							<input
								type="text"
								name="contexto"
								value={text}
								onChange={(v) => setText(v.target.value)}
								placeholder="Digite aqui o contexto"
								required
								className="taqui-input text-lg"
							/>
						</div>

						<div className="space-y-1">
							<label className="text-xs font-bold uppercase text-white/90">
								URL de destino
							</label>
							<input
								type="url"
								name="url"
								value={link}
								onChange={(v) => setLink(v.target.value)}
								placeholder="https://exemplo.com"
								required
								className="taqui-input text-lg"
							/>
						</div>

						<button type="submit" className="taqui-btn self-start px-4 py-2 text-xl">
							Encurtar
						</button>
					</Form>
				</GlassPanel>

				<GlassPanel tone="soft" className="flex flex-col gap-3 text-left">
					<h2 className="taqui-heading text-lg font-bold leading-tight">Resultado</h2>
					{shortUrl ? (
						<div className="flex flex-col gap-2 rounded-xl border-[3px] border-black bg-white p-4 text-gray-900">
							<p className="text-sm font-semibold text-gray-700">
								Seu link curto está pronto:
							</p>
							<a
								className="break-all text-lg font-bold underline"
								href={`/redirect/${shortUrl}`}
							>{`${origin}/redirect/${shortUrl}`}</a>
						</div>
					) : (
						<div className="flex min-h-[200px] flex-col items-start justify-center gap-2 rounded-xl border-[3px] border-dashed border-white/60 bg-white/5 p-4 text-sm text-white">
							<p className="font-semibold">Nenhum link gerado ainda.</p>
							<p className="text-xs text-white/85">
								Envie o formulário para criar um link curto com o contexto que preferir.
							</p>
						</div>
					)}
				</GlassPanel>
			</div>
		</PageShell>
	);
}
