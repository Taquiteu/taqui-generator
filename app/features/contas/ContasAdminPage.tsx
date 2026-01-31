import { useEffect, useState } from "react";
import {
	CheckCircleIcon,
	NotePencilIcon,
	PlusIcon,
	SignOutIcon,
	SnowflakeIcon,
	TrashIcon,
	UserCircleIcon,
	UserPlusIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import { PageShell } from "../../components/PageShell";
import { taquiToastPresets, useToast } from "../../components/Toast";

type AdminUser = {
	id: string;
	displayName: string;
	username: string;
	roles: string[];
	geladeira?: {
		pixKey: string;
		fridgeIds: string[];
	};
};

type LoaderData = {
	currentUser: { id: string; displayName: string };
	isAdmin: boolean;
	users: AdminUser[];
	fridges: Array<{ id: string; name: string }>;
};

type ActionData = { ok: true; message: string } | { ok: false; error: string };

export function ContasAdminPage() {
	const data = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData | undefined;
	const toast = useToast();
	const [createGeladeiraEnabled, setCreateGeladeiraEnabled] = useState(false);
	const [editGeladeiraEnabled, setEditGeladeiraEnabled] = useState<Record<string, boolean>>(
		() =>
			Object.fromEntries(
				data.users.map((user) => [user.id, Boolean(user.geladeira)]),
			),
	);

	const toggleEditGeladeira = (userId: string, next: boolean) => {
		setEditGeladeiraEnabled((prev) => ({ ...prev, [userId]: next }));
	};

	useEffect(() => {
		if (!actionData) return;
		if (actionData.ok) {
			toast({
				...taquiToastPresets.success,
				title: "TÁQUI!",
				message: actionData.message,
			});
			return;
		}
		toast({
			...taquiToastPresets.error,
			title: "DEU RUIM!",
			message: actionData.error,
		});
	}, [actionData, toast]);

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center gap-6">
				<div className="w-full max-w-[880px] rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000]">
								<UsersThreeIcon className="h-7 w-7 text-black" weight="bold" />
							</div>
							<div className="flex flex-col">
								<p className="text-2xl font-bold leading-8">Admin de Contas</p>
								<p className="text-sm leading-5 text-black/70">
									Logado como {data.currentUser.displayName}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Link
								to="/"
								className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
							>
								<UserCircleIcon className="h-5 w-5" weight="bold" />
								Hub
							</Link>
							<Form method="post">
								<input type="hidden" name="intent" value="logout" />
								<button
									type="submit"
									className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								>
									<SignOutIcon className="h-5 w-5" weight="bold" />
									Sair
								</button>
							</Form>
						</div>
					</div>
				</div>

				{data.isAdmin && (
					<div className="w-full max-w-[880px] rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-[#47B8FF] shadow-[2px_2px_0_#000000]">
								<UserPlusIcon className="h-6 w-6" weight="bold" />
							</div>
							<div>
								<p className="text-xl font-bold leading-7">Criar usuário</p>
								<p className="text-sm leading-5 text-black/70">
									Defina login e permissões do usuário.
								</p>
							</div>
						</div>

					<Form method="post" className="mt-4 flex flex-col gap-4">
						<input type="hidden" name="intent" value="create" />

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
							</div>

						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Senha</span>
								<input
									name="password"
									type="password"
									className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								/>
							</label>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label className="flex h-12 items-center justify-between rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000]">
								<span className="flex items-center gap-2">
									<CheckCircleIcon className="h-5 w-5" weight="bold" />
									Admin?
								</span>
								<input name="roleAdmin" type="checkbox" className="h-4 w-4" />
							</label>
							<label className="flex h-12 items-center justify-between rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000]">
								<span className="flex items-center gap-2">
									<SnowflakeIcon className="h-5 w-5" weight="bold" />
									Acesso Geladeira
								</span>
								<input
									name="geladeiraEnabled"
									type="checkbox"
									className="h-4 w-4"
									checked={createGeladeiraEnabled}
									onChange={(event) => setCreateGeladeiraEnabled(event.target.checked)}
								/>
							</label>
						</div>

							{createGeladeiraEnabled && (
								<>
									<label className="flex flex-col gap-2">
										<span className="text-sm font-bold">Pix (Geladeira)</span>
										<input
											name="geladeiraPixKey"
											type="text"
											placeholder="Chave Pix"
											className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
										/>
									</label>

									<div className="rounded-lg border-2 border-black bg-white p-4 shadow-[2px_2px_0_#000000]">
										<p className="text-sm font-bold text-black/70">
											Geladeiras permitidas
										</p>
										<div className="mt-3 grid gap-2 sm:grid-cols-2">
											{data.fridges.map((fridge) => (
												<label
													key={fridge.id}
													className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 font-bold shadow-[2px_2px_0_#000000]"
												>
													<span className="text-sm">{fridge.name}</span>
													<input
														type="checkbox"
														name="geladeiraFridgeIds"
														value={fridge.id}
														className="h-4 w-4"
													/>
												</label>
											))}
										</div>
									</div>
								</>
							)}

							<button
								type="submit"
								className="flex h-[56px] w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
							>
								<PlusIcon className="h-6 w-6" weight="bold" />
								Criar usuário
							</button>
						</Form>
					</div>
				)}

				<div className="w-full max-w-[880px] rounded-lg border-2 border-black bg-white font-mono text-black shadow-[4px_4px_0_#000000]">
					<div className="flex items-center justify-between border-b-2 border-black px-4 py-3 sm:px-6">
						<p className="text-xl font-bold leading-7">Usuários</p>
						<span className="text-sm text-black/70">{data.users.length}</span>
					</div>

					{data.users.length === 0 ? (
						<div className="p-6 text-center text-black/70">
							Nenhum usuário cadastrado.
						</div>
					) : (
						<div className="flex flex-col gap-6 p-4 sm:p-6">
							{data.users.map((user) => {
								const isRoot = user.id === "admin";
								const canEdit = data.isAdmin
									? !isRoot || data.currentUser.id === "admin"
									: user.id === data.currentUser.id;

								return (
									<div
										key={user.id}
										className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000000]"
									>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<p className="text-lg font-bold">{user.displayName}</p>
											<p className="text-sm text-black/70">@{user.username}</p>
											<p className="text-xs text-black/50">ID: {user.id}</p>
										</div>
										{data.isAdmin && user.id !== "admin" && (
											<Form method="post">
												<input type="hidden" name="intent" value="delete" />
												<input type="hidden" name="userId" value={user.id} />
												<button
													type="submit"
													className="flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
												>
													<TrashIcon className="h-5 w-5" weight="bold" />
													Remover
												</button>
											</Form>
										)}
									</div>

									<Form method="post" className="mt-4 flex flex-col gap-4">
										<input type="hidden" name="intent" value="update" />
										<input type="hidden" name="userId" value={user.id} />

										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<label className="flex flex-col gap-2">
												<span className="text-sm font-bold">Nome</span>
												<input
													name="displayName"
													type="text"
													defaultValue={user.displayName}
													disabled={!canEdit}
													className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none disabled:opacity-70"
												/>
											</label>
											<div className="flex flex-col gap-2">
												<span className="text-sm font-bold">Usuário</span>
												<div className="flex h-[56px] items-center rounded-lg border-2 border-black bg-[#47B8FF] px-4 text-lg font-bold shadow-[2px_2px_0_#000000]">
													@{user.username}
												</div>
											</div>
										</div>

										<label className="flex flex-col gap-2">
											<span className="text-sm font-bold">Nova senha</span>
											<input
												name="password"
												type="password"
												placeholder="Deixe vazio para manter"
												disabled={!canEdit}
												className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none disabled:opacity-70"
											/>
										</label>

										{data.isAdmin ? (
											<>
												<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
													<label className="flex h-12 items-center justify-between rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000]">
														<span className="flex items-center gap-2">
															<CheckCircleIcon className="h-5 w-5" weight="bold" />
															Admin?
														</span>
														<input
															name="roleAdmin"
															type="checkbox"
															defaultChecked={user.roles.includes("admin")}
															disabled={user.id === "admin" || !canEdit}
															className="h-4 w-4"
														/>
													</label>
													<label className="flex h-12 items-center justify-between rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000]">
														<span className="flex items-center gap-2">
															<SnowflakeIcon className="h-5 w-5" weight="bold" />
															Acesso Geladeira
														</span>
														<input
															name="geladeiraEnabled"
															type="checkbox"
															checked={editGeladeiraEnabled[user.id] ?? false}
															onChange={(event) =>
																toggleEditGeladeira(user.id, event.target.checked)
															}
															disabled={!canEdit}
															className="h-4 w-4"
														/>
													</label>
												</div>

												{editGeladeiraEnabled[user.id] && (
													<>
														<label className="flex flex-col gap-2">
															<span className="text-sm font-bold">Pix (Geladeira)</span>
															<input
																name="geladeiraPixKey"
																type="text"
																defaultValue={user.geladeira?.pixKey ?? ""}
																placeholder="Chave Pix"
																disabled={!canEdit}
																className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
															/>
														</label>

														<div className="rounded-lg border-2 border-black bg-white p-4 shadow-[2px_2px_0_#000000]">
															<p className="text-sm font-bold text-black/70">
																Geladeiras permitidas
															</p>
															<div className="mt-3 grid gap-2 sm:grid-cols-2">
																{data.fridges.map((fridge) => (
																	<label
																		key={fridge.id}
																		className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 font-bold shadow-[2px_2px_0_#000000]"
																	>
																		<span className="text-sm">{fridge.name}</span>
																		<input
																			type="checkbox"
																			name="geladeiraFridgeIds"
																			value={fridge.id}
																			defaultChecked={user.geladeira?.fridgeIds.includes(fridge.id)}
																			disabled={!canEdit}
																			className="h-4 w-4"
																		/>
																	</label>
																))}
															</div>
														</div>
													</>
												)}
											</>
										) : (
											user.geladeira && (
												<label className="flex flex-col gap-2">
													<span className="text-sm font-bold">Pix (Geladeira)</span>
													<input
														name="geladeiraPixKey"
														type="text"
														defaultValue={user.geladeira.pixKey}
														placeholder="Chave Pix"
														disabled={!canEdit}
														className="h-[56px] w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
													/>
												</label>
											)
										)}

										{canEdit && (
											<button
												type="submit"
												className="flex h-[56px] w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
											>
												<NotePencilIcon className="h-6 w-6" weight="bold" />
												Salvar alterações
											</button>
										)}
									</Form>
								</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</PageShell>
	);
}
