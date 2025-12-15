import { useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import {
	AlienIcon,
	CopyIcon,
	DiceSixIcon,
	EyeglassesIcon,
	ShieldStarIcon,
	SmileyMehIcon,
} from "@phosphor-icons/react";
import { PageShell } from "../../components/PageShell";
import { taquiToastPresets, useToast } from "../../components/Toast";

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 32;

type PasswordOptions = {
	length: number;
	includeUppercase: boolean;
	includeLowercase: boolean;
	includeNumbers: boolean;
	includeSymbols: boolean;
};

type PasswordStrengthKind = "grandma" | "meh" | "shielded" | "alien";

type PasswordStrengthTag = {
	kind: PasswordStrengthKind;
	label: string;
	color: string;
	Icon: typeof EyeglassesIcon;
};

const COPY_SUCCESS_MESSAGES: Record<PasswordStrengthKind, string> = {
	grandma: "Um hacker russo acabou de adivinhar sua senha antes de você terminar de ler.",
	meh: "O sobrinho do vizinho não descobre, mas um hacker russo nem suaria.",
	shielded: "Aí sim! O hacker russo olhou pra essa senha e decidiu atacar outra pessoa.",
	alien: "Nem você vai conseguir decorar isso. Imagina o hacker russo. Perfeita!",
};

export const passMeta: MetaFunction = () => {
	return [
		{ title: "Táqui Tua Senha" },
		{
			name: "description",
			content:
				"Gere senhas fortes e configure tamanho e tipos de caracteres no Táqui Generator.",
		},
	];
};

function clampNumber(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function getRandomInt(maxExclusive: number) {
	if (maxExclusive <= 1) return 0;

	const cryptoApi = typeof crypto !== "undefined" ? crypto : undefined;
	if (!cryptoApi?.getRandomValues) {
		return Math.floor(Math.random() * maxExclusive);
	}

	const maxUint32 = 0xffff_ffff;
	const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;
	const buffer = new Uint32Array(1);

	while (true) {
		cryptoApi.getRandomValues(buffer);
		const value = buffer[0]!;
		if (value < limit) return value % maxExclusive;
	}
}

function shuffleArray<T>(items: T[]) {
	const array = [...items];
	for (let index = array.length - 1; index > 0; index -= 1) {
		const swapIndex = getRandomInt(index + 1);
		[array[index], array[swapIndex]] = [array[swapIndex]!, array[index]!];
	}
	return array;
}

function buildPassword(options: PasswordOptions) {
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const symbols = "!@#$%&*()-_=+[]{};:,.<>/?";

	const pools: { enabled: boolean; chars: string }[] = [
		{ enabled: options.includeUppercase, chars: uppercase },
		{ enabled: options.includeLowercase, chars: lowercase },
		{ enabled: options.includeNumbers, chars: numbers },
		{ enabled: options.includeSymbols, chars: symbols },
	];

	const enabledPools = pools.filter((pool) => pool.enabled);
	if (enabledPools.length === 0) {
		return { password: "", error: "Escolhe pelo menos um tipo de caractere." };
	}

	const length = clampNumber(
		Math.floor(options.length),
		PASSWORD_MIN_LENGTH,
		PASSWORD_MAX_LENGTH,
	);

	const requiredCharacters = enabledPools.map((pool) => {
		const index = getRandomInt(pool.chars.length);
		return pool.chars[index]!;
	});

	const allCharacters = enabledPools.map((pool) => pool.chars).join("");

	const remainingLength = Math.max(length - requiredCharacters.length, 0);
	const rest = Array.from({ length: remainingLength }, () => {
		const index = getRandomInt(allCharacters.length);
		return allCharacters[index]!;
	});

	const passwordCharacters = shuffleArray([...requiredCharacters, ...rest]);
	return { password: passwordCharacters.join("") };
}

function getPasswordEntropy(password: string) {
	if (password.length === 0) return 0;

	const hasUppercase = /[A-Z]/.test(password);
	const hasLowercase = /[a-z]/.test(password);
	const hasNumbers = /[0-9]/.test(password);
	const hasSymbols = /[^A-Za-z0-9]/.test(password);

	const charsetSize =
		(hasUppercase ? 26 : 0) +
		(hasLowercase ? 26 : 0) +
		(hasNumbers ? 10 : 0) +
		(hasSymbols ? 24 : 0);

	if (charsetSize === 0) return 0;
	return password.length * Math.log2(charsetSize);
}

function getPasswordStrengthTag(password: string): PasswordStrengthTag {
	const entropy = getPasswordEntropy(password);

	if (entropy < 45) {
		return {
			kind: "grandma",
			label: "Senha de Vó",
			color: "#FF4D4D",
			Icon: EyeglassesIcon,
		};
	}

	if (entropy < 70) {
		return { kind: "meh", label: "Méh", color: "#FF9F29", Icon: SmileyMehIcon };
	}

	if (entropy < 95) {
		return {
			kind: "shielded",
			label: "Blindada",
			color: "#00FF55",
			Icon: ShieldStarIcon,
		};
	}

	return { kind: "alien", label: "Alien", color: "#BF5AF2", Icon: AlienIcon };
}

function ToggleCard({
	title,
	description,
	checked,
	onToggle,
}: {
	title: string;
	description: string;
	checked: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="flex w-full flex-col gap-1 rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
			<div className="flex items-center justify-between gap-4">
				<p className="text-2xl font-bold leading-9">{title}</p>

				<button
					type="button"
					onClick={onToggle}
					aria-pressed={checked}
					className="relative h-[18px] w-[36px] shrink-0 cursor-pointer rounded-full shadow-[4px_4px_0_#000000] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
				>
					<span
						className="absolute inset-0 rounded-full border border-black shadow-[2px_2px_0_#000000]"
						style={{ background: checked ? "#FFF129" : "#9D9D9D" }}
					/>
					<span
						className="absolute top-[2px] left-[2px] h-[14px] w-[14px] rounded-full border border-black bg-[#47B8FF] transition-transform"
						style={{ transform: checked ? "translateX(18px)" : "translateX(0px)" }}
					/>
				</button>
			</div>

			<p className="text-lg leading-[26px]">{description}</p>
		</div>
	);
}

export function PassPage() {
	const [options, setOptions] = useState<PasswordOptions>({
		length: 14,
		includeUppercase: true,
		includeLowercase: true,
		includeNumbers: true,
		includeSymbols: true,
	});

	const [password, setPassword] = useState<string>("h52YEnx1N,]S7!");
	const [copyButtonText, setCopyButtonText] = useState("Copiar");
	const toast = useToast();

	useEffect(() => {
		// Generate one after mount so it feels fresh without SSR hydration mismatch.
		const { password: nextPassword, error } = buildPassword(options);
		if (error) return;
		if (!nextPassword) return;
		setPassword(nextPassword);
	}, []);

	const strengthTag = useMemo(
		() => getPasswordStrengthTag(password),
		[password],
	);

	const sliderPercent = useMemo(() => {
		const clampedLength = clampNumber(
			Math.floor(options.length),
			PASSWORD_MIN_LENGTH,
			PASSWORD_MAX_LENGTH,
		);
		return (
			((clampedLength - PASSWORD_MIN_LENGTH) /
				(PASSWORD_MAX_LENGTH - PASSWORD_MIN_LENGTH)) *
			100
		);
	}, [options.length]);

	const generate = () => {
		const result = buildPassword(options);
		if (result.error) {
			toast({
				...taquiToastPresets.warning,
				title: "OPA!",
				message: result.error,
			});
			return;
		}

		setPassword(result.password);
		setCopyButtonText("Copiar");
	};

	const copy = async () => {
		if (!password) return;
		try {
			await navigator.clipboard.writeText(password);
			setCopyButtonText("Copiado!");
			toast({
				...taquiToastPresets.success,
				title: "TÁQUI!",
				message: COPY_SUCCESS_MESSAGES[strengthTag.kind],
			});
			setTimeout(() => setCopyButtonText("Copiar"), 2000);
		} catch (error) {
			console.error("Erro ao copiar senha:", error);
			toast({
				...taquiToastPresets.error,
				title: "DEU RUIM!",
				message: "Não foi possível copiar a senha.",
			});
		}
	};

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center gap-8">
				<div className="flex w-full max-w-[540px] flex-col gap-6">
					<div className="relative w-full">
						<label htmlFor="pass-generated" className="sr-only">
							Senha gerada
						</label>
						<input
							id="pass-generated"
							type="text"
							readOnly
							value={password}
							className="h-[60px] w-full rounded-lg border-[3px] border-black bg-white p-4 font-mono text-2xl leading-7 text-black shadow-[3px_3px_0_#000000] focus:outline-none"
						/>

						<div
							className="absolute right-[-8px] top-[-12px] inline-flex items-center gap-1.5 rounded-full border border-black px-2 py-1 font-mono text-[10px] font-semibold leading-4 text-black shadow-[2px_2px_0_#000000]"
							style={{ background: strengthTag.color }}
						>
							<strengthTag.Icon className="h-4 w-4" weight="bold" />
							{strengthTag.label}
						</div>
					</div>

					<div className="flex w-full flex-col gap-6 sm:flex-row">
						<button
							type="button"
							onClick={generate}
							className="flex h-[60px] w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#FFF129] px-[14px] py-3 font-mono text-2xl font-bold leading-9 text-black sm:w-[258px]"
						>
							<DiceSixIcon className="h-7 w-7" weight="bold" />
							Gerar
						</button>

						<button
							type="button"
							onClick={() => void copy()}
							className="flex h-[60px] w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#FFF129] px-[14px] py-3 font-mono text-2xl font-bold leading-9 text-black sm:w-[258px]"
						>
							{copyButtonText === "Copiar" && (
								<CopyIcon className="h-7 w-7" weight="bold" />
							)}
							{copyButtonText}
						</button>
					</div>
				</div>

				<div className="flex w-full max-w-[540px] flex-col gap-6">
					<div className="w-full rounded-lg border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000000]">
						<div className="flex w-full flex-col gap-2 font-mono text-black">
							<p className="text-2xl font-bold leading-9">Tamanho da senha</p>
							<div className="flex items-center gap-4">
								<input
									type="range"
									min={PASSWORD_MIN_LENGTH}
									max={PASSWORD_MAX_LENGTH}
									step={1}
									value={options.length}
									onChange={(event) =>
										setOptions((prev) => ({
											...prev,
											length: Number(event.target.value),
										}))
									}
									className="taqui-slider"
									style={
										{
											"--taqui-slider-value": `${sliderPercent}%`,
										} as React.CSSProperties
									}
									aria-label="Tamanho da senha"
								/>
								<p className="w-8 text-right text-xl leading-7">
									{clampNumber(
										Math.floor(options.length),
										PASSWORD_MIN_LENGTH,
										PASSWORD_MAX_LENGTH,
									)}
								</p>
							</div>
						</div>
					</div>

					<div className="grid w-full gap-6 sm:grid-cols-2">
						<ToggleCard
							title="ABC"
							description="Incluir Maiúsculas"
							checked={options.includeUppercase}
							onToggle={() =>
								setOptions((prev) => ({
									...prev,
									includeUppercase: !prev.includeUppercase,
								}))
							}
						/>
						<ToggleCard
							title="abc"
							description="Incluir Minúsculas"
							checked={options.includeLowercase}
							onToggle={() =>
								setOptions((prev) => ({
									...prev,
									includeLowercase: !prev.includeLowercase,
								}))
							}
						/>
						<ToggleCard
							title="123"
							description="Incluir Números"
							checked={options.includeNumbers}
							onToggle={() =>
								setOptions((prev) => ({
									...prev,
									includeNumbers: !prev.includeNumbers,
								}))
							}
						/>
						<ToggleCard
							title="#$&"
							description="Incluir Símbolos"
							checked={options.includeSymbols}
							onToggle={() =>
								setOptions((prev) => ({
									...prev,
									includeSymbols: !prev.includeSymbols,
								}))
							}
						/>
					</div>
				</div>
			</div>
		</PageShell>
	);
}
