import type { MetaFunction } from "react-router";
import { GlassPanel } from "../../components/GlassPanel";
import { PageShell } from "../../components/PageShell";

type HubCardProps = {
	title: string;
	description: string;
	href: string;
	badge: string;
};

type HubStatProps = {
	label: string;
	value: string;
	detail: string;
};

const hubCards: HubCardProps[] = [
	{
		title: "Taqui teu texto",
		description:
			"Use o gerador oficial para criar o meme “Tá aqui” com qualquer frase e copiar rapidinho.",
		href: "/generator",
		badge: "Disponível",
	},
	{
		title: "Meu IP",
		description:
			"Veja seu IP público em texto e também como uma imagem pronta no estilo Táqui.",
		href: "/ip",
		badge: "Novo",
	},
	{
		title: "Encurtador de links",
		description:
			"Experimento para gerar links curtos que redirecionam.",
		href: "/link",
		badge: "Beta",
	},
];

export const hubMeta: MetaFunction = () => {
	return [
		{ title: "Táqui Hub" },
		{
			name: "description",
			content: "Centralize o acesso às páginas do projeto Táqui.",
		},
	];
};

export function HubPage() {
	return (
		<PageShell
			title="Táqui Hub"
		>
			<GlassPanel tone="strong" className="w-full">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{hubCards.map((card) => (
						<HubCard key={card.href} {...card} />
					))}
				</div>
			</GlassPanel>
		</PageShell>
	);
}

function HubCard({ title, description, href, badge }: HubCardProps) {
	return (
		<div className="flex h-full flex-col gap-3 rounded-2xl border-[3px] border-white/60 bg-white/10 p-4 text-left shadow-[0_10px_0_rgba(0,0,0,0.15)]">
			<div className="flex items-center gap-2 text-xs font-bold uppercase text-white/90">
				<span className="rounded-full border border-white/60 bg-white/20 px-3 py-1">
					{badge}
				</span>
			</div>
			<h2 className="taqui-heading text-xl font-bold leading-tight">
				{title}
			</h2>
			<p className="flex-1 text-sm text-white/85">{description}</p>
			<a className="taqui-btn w-full justify-center px-4 py-2 text-base" href={href}>
				Acessar
			</a>
		</div>
	);
}
