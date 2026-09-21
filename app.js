const templates = [
  { id: "R01", section: "cadastro", scenario: "Visão geral", label: "Pendências combinadas · personalizado", text: "Olá. Aqui é a XX, sou executiva comercial da 99Food. Tudo bem?\nO cadastro da sua loja consta como não finalizado no sistema e precisamos concluir a validação das informações para prosseguir.\nVerifiquei o que está faltando:\nCardápio ❌\nFotos da fachada ❌\nDados bancários ❌ — agência, conta e banco, vinculado ao CNPJ", flags: ["bank"] },
  { id: "R02", section: "cadastro", scenario: "Primeiro contato", label: "Convite para completar cadastro · marketing", code: "CRMSIS_SALES_WPP_ALERT_SIGNED_ALL_20260715_FUP1_MKT_SIGNED_V2_A2", text: "Olá!\nSabia que os parceiros da sua região já estão com o prato cheio de pedidos na 99Food?\nA sua loja também pode vender muito por aqui! Falta pouco para ativar seu perfil, só precisamos das suas informações de cadastro.", flags: ["promise"] },
  { id: "R03", section: "cadastro", scenario: "Acompanhamento", label: "Atualização de cadastro · utility", code: "CRMSIS_SALES_WPP_ALERT_SIGNED_ALL_20260715_FUP1_UTILITY_SIGNED_V2", text: "Olá XX, atualização sobre o seu cadastro na 99Food.\nIdentificamos que faltam dados para concluir a abertura da sua conta. Sem essas informações, o seu restaurante permanece invisível para os clientes do aplicativo. ⚠️\nPor favor, nos envie os dados pendentes respondendo diretamente aqui.\nAssim que recebermos, nossa equipe valida tudo rapidamente para liberar as suas vendas.", flags: ["bank", "deadline"] },
  { id: "R06", section: "cadastro", scenario: "Cardápio", label: "Envio do cardápio", code: "CRMSIS_SALES_WPP_ALERT_SIGNED_MENU_22042026", text: "*Pendência de Cardápio:*\nOlá, esta etapa consta como pendente no sistema. Envie uma foto ou PDF do menu para nossa validação.", flags: [] },
  { id: "R07", section: "cadastro", scenario: "Fachada", label: "Foto da fachada", code: "CRMSIS_SALES_WPP_ALERT_SIGNEDLIDIA_STOREPHOTO_28042026", text: "Olá! A foto da fachada é obrigatória para a ativação. Envie uma imagem nítida da frente da loja para facilitar a identificação logística.", flags: [] },
  { id: "R04", section: "cadastro", scenario: "Dados bancários", label: "Conta bancária · primeiro aviso", code: "CRMSIS_SALES_WPP_ALERT_SIGNED_CONTABANCARIA1_22042026", text: "*Configure sua conta bancária, XXXXXX para que você receba o valor das suas vendas semanalmente, basta apenas cadastrar sua conta. Finalize esse passo agora para liberar sua operação.", flags: ["bank", "deadline"] },
  { id: "R05", section: "cadastro", scenario: "Dados bancários", label: "Conta bancária · segundo aviso", code: "CRMSIS_SALES_WPP_ALERT_SIGNED_CONTABANCARIA2_22042026", text: "XX, vimos que você não avançou com o envio dos dados bancários. Para iniciar sua operação, complete essa etapa agora.", flags: ["bank"] },
  { id: "R08", section: "cadastro", scenario: "Dados bancários", label: "Conta bancária · terceiro aviso", code: "CRMSIS_SALES_WPP_ALERT_SIGNEDLIDIA_CONTABANCARIA3_28042026", text: "Olá! Seu restaurante continua fora do app porque a conta bancária não foi cadastrada.\nRegularize seus dados agora para não perder mais tempo e colocar sua loja no ar imediatamente.", flags: ["bank", "deadline"] },
  { id: "R09", section: "cadastro", scenario: "Dados bancários", label: "Conta bancária · vínculo de cadastro", code: "CRMSIS_SALES_WPP_ALERT_BANKACCOUNTINFO_SIGNEDLIDIA_20260128_A1", text: "*⚠️ Sua loja não pode ser ativada sem seus dados bancários!*\nVimos que você ainda não cadastrou sua conta para vender com a 99Food! Sem essa informação, não conseguimos ativar sua loja para começar a vender.\nEste é um passo essencial para você poder receber seus pagamentos. Clique abaixo para preencher de forma rápida e segura.", flags: ["bank", "link"] },
  { id: "O04", section: "online", scenario: "Primeiro contato", label: "Loja pronta · primeiro contato", code: "CRMSIS_SALES_WPP_ALERT_RTBO_ALL_20260720_PRIMEIRO_CONTATO_RTBO", text: "🚀 XX, sua loja está totalmente pronta para brilhar na 99Food!\nSó falta um detalhe para os pedidos começarem a chegar: abrir a sua loja no aplicativo. *Ficar online é muito fácil e nós te ajudamos em cada etapa.*\nVamos começar agora mesmo?", flags: ["promise"] },
  { id: "O02", section: "online", scenario: "Sem tempo", label: "Rotina corrida · abordagem curta", code: "CRMSIS_SALES_WPP_ALERT_RTBO_ALL_20260716_SEMTEMPO_TEMPLATE1_RTBO_V2", text: "Oi! Sabemos que a rotina de quem cuida de um restaurante é muito corrida.\nA boa notícia é que colocar a sua loja da 99Food online leva menos de um minuto. Enquanto você foca na cozinha e no atendimento, o nosso aplicativo trabalha para trazer novos pedidos para você.", flags: ["time", "promise"] },
  { id: "O05", section: "online", scenario: "Sem tempo", label: "Rotina corrida · variação com pergunta", code: "DUPLICATE_OF_CRMSIS_SALES_WPP_ALERT_RTBO_ALL_20260720_NAO_TIVE_TEMPO", text: "Oi, XX! Sabemos que a rotina de quem cuida de um restaurante é muito corrida.\nA boa notícia é que *colocar a sua loja da 99Food online leva menos de um minuto.*\nEnquanto você foca na cozinha e no atendimento, o nosso aplicativo trabalha para trazer novos pedidos para você.\nQue tal resolver isso rapidinho e já começar a vender hoje?", flags: ["time", "duplicate", "promise"] },
  { id: "O03", section: "online", scenario: "Acompanhamento", label: "Alerta de oportunidade", code: "CRMSIS_SALES_WPP_ALERT_RTBO_ALL_20260716_URGENCIA_TEMPLATE1_RTBO_V2", text: "*⚠️ Alerta de oportunidade!*\nEnquanto a sua loja continua offline, os restaurantes vizinhos já estão recebendo pedidos na 99Food.\nNão deixe os seus clientes comprarem da concorrência justo no horário de pico. A sua operação está totalmente pronta para faturar muito mais!", flags: ["promise"] },
  { id: "O06", section: "online", scenario: "Acompanhamento", label: "Pendência de ativação e possível suspensão", text: "Olá! 😊\nSou a XX, da 99Food! 🛵💛\nPercebi que sua loja ainda não foi colocada online.\nEsse é o último passo para concluir a ativação e começar a vender pela plataforma.\n⚠️ Caso a ativação não aconteça até o dia XX/XX, o cadastro poderá ser suspenso.\nSe precisar de ajuda para finalizar, me avise!", flags: ["suspension"] },
  { id: "O01", section: "online", scenario: "Passo a passo", label: "Abrir loja · instruções breves", code: "CRMSIS_SALES_WPP_ALERT_RTBO_ALL_20260715_PASSOAPASSO_TEMPLATE1_RTBO_V2", text: "Olá!! Ficar online é muito mais fácil do que você imagina e os clientes já estão com fome. 🎉\nOs pedidos na sua região estão bombando e a sua loja na 99Food precisa aproveitar essa chance de lucrar mais. Siga estes três passos rápidos para começar a vender:\n1. Abra o aplicativo 99Loja\n2. Vá até a Tela Inicial\n3. Toque na opção Abrir Loja", flags: ["tutorial", "promise"] },
  { id: "O08", section: "online", scenario: "Passo a passo", label: "Gestor · instalação, login e conexão", text: "Bom dia! Tudo bem? Sou XX da 99Food! 🛵💛\nPassando para avisar que sua loja está pronta; vamos fazer o teste do sistema para validar a ativação?\n⚡ Passo 1: Baixe o Gestor\nAndroid: Busque por \"99Food Parceiros\" na Play Store.\nComputador: https://merchant.99app.com/pt-BR/store/download-entry\n⚡ Passo 2: Login\nAcesse com seu celular ou e-mail cadastrado. Se precisar, use o \"Esqueci a senha\".\n⚡ Passo 3: Validar a conexão 🟢\nNo menu lateral (☰), clique em Abrir Estabelecimento.\n💡 Dica: Assim que fizer o teste de conexão, me mande um \"OK\". Para desconectar, repita o passo 3 e feche o estabelecimento.", flags: ["tutorial", "links"] },
  { id: "O09", section: "online", scenario: "Passo a passo", label: "Loja pronta + tutorial integrado", text: "Olá, sua loja está totalmente pronta para brilhar na 99Food!\nSó falta um detalhe para os pedidos começarem a chegar: abrir a sua loja no aplicativo. *Ficar online é muito fácil e nós te ajudamos em cada etapa.*\n⚡ Passo 1: Baixe o Gestor\nAndroid: Busque por \"99Food Parceiros\" na Play Store.\nComputador: https://merchant.99app.com/pt-BR/store/download-entry\n⚡ Passo 2: Login\nAcesse com seu celular ou e-mail cadastrado. Se precisar, use o \"Esqueci a senha\".\n⚡ Passo 3: Validar a conexão 🟢\nNo menu lateral (☰), clique em Abrir Estabelecimento.\n💡 Dica: Assim que fizer o teste de conexão, me mande um \"OK\". Para desconectar, repita o passo 3 e feche o estabelecimento.\nVamos começar agora mesmo?", flags: ["tutorial", "duplicate", "links", "promise"] },
  { id: "O07", section: "online", scenario: "Validação da ativação", label: "Teste rápido · cerca de 2 minutos", text: "Boa tarde! 😊\nAqui é a XX, da 99Food! 🛵💛\nTudo bem?\nPreciso da sua ajuda com uma etapa bem rápida: basta deixar sua loja online por cerca de 2 minutos. Isso permite que o sistema reconheça que ela está ativa e conclua a validação do cadastro.\nPosso te enviar o passo a passo de como colocar a loja online? 😊", flags: ["time", "tutorial"] }
];

const flagMessages = {
  bank: "Confira o uso do canal oficial e seguro para dados bancários.", deadline: "Valide o prazo, as condições e as promessas de agilidade antes do envio.", link: "O texto menciona “clique abaixo”, mas não apresenta o link.", promise: "Valide as afirmações sobre pedidos, concorrência, faturamento ou agilidade.", tutorial: "Confirme o nome do aplicativo e o fluxo operacional vigente.", time: "Confirme com a operação o tempo de ativação ou teste informado.", duplicate: "Variação similar a outro texto, preservada do material recebido.", suspension: "Use somente com prazo e regra de suspensão confirmados para esse cadastro.", links: "Teste os URLs e confirme que são os links oficiais."
};

const $ = (id) => document.getElementById(id);
let phase = "todos";
let selectedId = templates[0].id;
let showingOriginal = false;

function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function sectionLabel(section) { return section === "cadastro" ? "FINALIZAR CADASTRO" : "FICAR ONLINE"; }
function personalize(text) {
  const name = $("name").value.trim(); const executive = $("executive").value.trim(); const date = $("date").value.trim();
  let value = text;
  if (date) value = value.replaceAll("XX/XX", date);
  if (executive) value = value.replace(/(Aqui é a |Aqui é |Sou a )\s*(XX|xx)\b/g, `$1${executive}`);
  if (name) value = value.replace(/\bX{2,6}\b/gi, name);
  return value;
}
function visibleTemplates() {
  const query = $("search").value.trim().toLocaleLowerCase("pt-BR"); const scenario = $("scenario").value;
  return templates.filter((item) => (phase === "todos" || item.section === phase) && (!scenario || item.scenario === scenario) && (!query || [item.id, item.label, item.scenario, item.text, item.code].join(" ").toLocaleLowerCase("pt-BR").includes(query)));
}
function syncScenarios() {
  const previous = $("scenario").value;
  const scenarios = [...new Set(templates.filter((item) => phase === "todos" || item.section === phase).map((item) => item.scenario))];
  $("scenario").innerHTML = `<option value="">Todas as situações</option>${scenarios.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}`;
  if (scenarios.includes(previous)) $("scenario").value = previous;
}
function renderDetail() {
  const item = templates.find((template) => template.id === selectedId); $("detail").classList.toggle("hidden", !item); if (!item) return;
  $("detail-id").textContent = `${item.id} / ${sectionLabel(item.section)}`; $("detail-title").textContent = item.label; $("detail-scenario").textContent = item.scenario;
  $("code").textContent = item.code || "Não informado no documento original"; $("copy-code").hidden = !item.code;
  $("message").textContent = showingOriginal ? item.text : personalize(item.text);
  $("show-original").textContent = showingOriginal ? "Usar texto personalizado" : "Ver original";
  $("review").hidden = item.flags.length === 0; $("warnings").innerHTML = item.flags.map((flag) => `<li>${escapeHtml(flagMessages[flag])}</li>`).join("");
}
function renderList() {
  const items = visibleTemplates(); if (!items.some((item) => item.id === selectedId)) { selectedId = items[0]?.id ?? null; showingOriginal = false; }
  $("shown").textContent = `${items.length} modelos encontrados`; $("total").textContent = `${templates.length} modelos disponíveis`;
  $("list").innerHTML = items.length ? items.map((item) => `<button class="item ${item.id === selectedId ? "active" : ""}" data-id="${item.id}" aria-pressed="${item.id === selectedId}"><div class="item-top"><span>${item.id} · ${sectionLabel(item.section)}</span><span class="mini">${escapeHtml(item.scenario)}</span></div><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.text.replace(/\s+/g, " ").slice(0, 90))}${item.text.length > 90 ? "…" : ""}</p></button>`).join("") : '<p class="empty">Nenhum modelo encontrado.<br>Altere a busca ou os filtros.</p>';
  document.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => { selectedId = button.dataset.id; showingOriginal = false; renderList(); if (matchMedia("(max-width: 660px)").matches) $("detail").scrollIntoView({ behavior: "smooth", block: "start" }); }));
  renderDetail();
}
async function copy(value, button) {
  const label = button.textContent; try { await navigator.clipboard.writeText(value); button.textContent = "✓ Copiado!"; } catch { window.prompt("Copie o conteúdo abaixo:", value); } setTimeout(() => { button.textContent = label; }, 1500);
}
document.querySelectorAll(".phase").forEach((button) => { const itemPhase = button.dataset.phase; button.querySelector("span").textContent = itemPhase === "todos" ? templates.length : templates.filter((item) => item.section === itemPhase).length; button.addEventListener("click", () => { phase = itemPhase; document.querySelectorAll(".phase").forEach((phaseButton) => { const active = phaseButton === button; phaseButton.classList.toggle("active", active); phaseButton.setAttribute("aria-pressed", String(active)); }); syncScenarios(); renderList(); }); });
$("search").addEventListener("input", renderList); $("scenario").addEventListener("change", renderList); ["name", "executive", "date"].forEach((id) => $(id).addEventListener("input", () => { showingOriginal = false; renderDetail(); }));
$("reset").addEventListener("click", () => { $("search").value = ""; $("scenario").value = ""; renderList(); });
$("copy-message").addEventListener("click", (event) => { const item = templates.find((template) => template.id === selectedId); if (item) copy(showingOriginal ? item.text : personalize(item.text), event.currentTarget); });
$("copy-code").addEventListener("click", (event) => { const item = templates.find((template) => template.id === selectedId); if (item?.code) copy(item.code, event.currentTarget); });
$("show-original").addEventListener("click", () => { showingOriginal = !showingOriginal; renderDetail(); });
syncScenarios(); renderList();
