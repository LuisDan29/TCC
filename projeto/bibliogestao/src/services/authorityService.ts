import {
  formatCatalogName,
  isCatalogFormat,
  normalizeName,
} from "../utils/textUtils";

// Padroniza nomes de autores no formato "SOBRENOME, Nome" usando os registros
// de autoridade do VIAF (que reúne, entre outras, a Biblioteca Nacional do
// Brasil, a Biblioteca Nacional de Portugal e a Library of Congress).
//
// Regra de ouro: se não houver certeza de quem é o autor, o nome NÃO é
// alterado e volta marcado como não confirmado, para o bibliotecário conferir.

export type StandardizedAuthor = {
  original: string;
  name: string;
  confirmed: boolean;
  source: string | null;
  note: string;
};

export type StandardizeOptions = {
  bookTitle?: string;
  publicationYear?: number | null;
  knownAuthors?: string[];
};

type Heading = { text: string; sources: string[] };

type Cluster = {
  id: string;
  headings: Heading[];
  variants: string[];
  titles: string[];
  birthYear: number | null;
};

type ParsedHeading = { surname: string; rest: string };
type Pick = ParsedHeading & { source: string };

// O navegador bloqueia chamadas diretas ao VIAF (CORS). Por isso as chamadas
// vão para o próprio site, em "/viaf-api", e o servidor repassa ao VIAF:
// no desenvolvimento pelo proxy do vite.config.ts, e em produção pelo
// "rewrite" do vercel.json.
const VIAF_URL = "/viaf-api";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_CANDIDATES = 4;

// Ordem de preferência quando as fontes divergem: Biblioteca Nacional do
// Brasil primeiro, depois Portugal, Library of Congress e outras nacionais.
// Fontes fora desta lista nunca são usadas para decidir o sobrenome.
const SOURCE_PRIORITY = ["BLBNB", "PTBNP", "LC", "BNE", "BNF", "DNB"];

// Partículas que não contam como "parte significativa" de um nome
const PARTICLES = new Set([
  "de", "da", "do", "das", "dos", "e", "del", "della", "di", "du",
  "la", "le", "van", "von", "der", "den", "y",
]);

// ---------------------------------------------------------------------------
// Utilidades de JSON e rede
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Algumas respostas do VIAF prefixam as chaves com "ns2:", "ns3:"...
function stripNamespaces(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripNamespaces);
  if (!isRecord(value)) return value;

  const clean: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    clean[key.replace(/^ns\d+:/, "")] = stripNamespaces(item);
  }

  return clean;
}

async function fetchJson(url: string): Promise<unknown> {
  // O VIAF decide o formato da resposta pelo cabeçalho Accept
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`O VIAF respondeu ${response.status} para ${url}`);
  }

  const body = await response.text();

  try {
    return JSON.parse(body);
  } catch {
    // Mostra o começo da resposta para facilitar descobrir o que veio
    throw new Error(
      `Resposta que não é JSON para ${url}: ${body.slice(0, 120)}`,
    );
  }
}

// Cache em memória (vale enquanto a página estiver aberta). Falhas não são
// guardadas, para que uma nova tentativa possa dar certo.
const suggestCache = new Map<string, Promise<string[]>>();
const clusterCache = new Map<string, Promise<Cluster | null>>();

function cached<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>,
): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit;

  const promise = load().catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Consultas ao VIAF
// ---------------------------------------------------------------------------

// Devolve os IDs de clusters de PESSOAS que o VIAF sugere para o nome
function searchCandidateIds(name: string): Promise<string[]> {
  return cached(suggestCache, name.toLocaleLowerCase("pt-BR"), async () => {
    const url = `${VIAF_URL}/AutoSuggest?query=${encodeURIComponent(name)}`;
    const data = stripNamespaces(await fetchJson(url));

    if (!isRecord(data)) return [];

    console.info(
      `[autoridade] AutoSuggest "${name}":`,
      JSON.stringify(data).slice(0, 400),
    );

    return asArray(data.result)
      .filter(isRecord)
      .filter((item) => asText(item.nametype).toLowerCase() === "personal")
      .map((item) => String(item.viafid ?? ""))
      .filter((id) => /^\d+$/.test(id))
      .slice(0, MAX_CANDIDATES);
  });
}

function collectNames(node: unknown, found: string[]) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectNames(item, found));
    return;
  }

  if (!isRecord(node)) return;

  if (node["@code"] === "a" && typeof node["#text"] === "string") {
    found.push(node["#text"]);
  }

  if (typeof node.text === "string") found.push(node.text);

  Object.values(node).forEach((item) => collectNames(item, found));
}

function collectTitles(node: unknown, found: string[]) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectTitles(item, found));
    return;
  }

  if (!isRecord(node)) return;

  if (typeof node.title === "string") found.push(node.title);

  Object.values(node).forEach((item) => collectTitles(item, found));
}

function parseCluster(id: string, raw: unknown): Cluster | null {
  let root = stripNamespaces(raw);

  if (isRecord(root) && isRecord(root.VIAFCluster)) root = root.VIAFCluster;
  if (!isRecord(root)) return null;

  const headings: Heading[] = [];

  if (isRecord(root.mainHeadings)) {
    for (const item of asArray(root.mainHeadings.data)) {
      if (!isRecord(item)) continue;

      const text = asText(item.text);
      if (!text) continue;

      const sources = isRecord(item.sources)
        ? asArray(item.sources.s).map(asText).filter(Boolean)
        : [];

      headings.push({ text, sources });
    }
  }

  if (headings.length === 0) {
    console.warn(
      `[autoridade] VIAF ${id}: formato inesperado, campos recebidos:`,
      Object.keys(root),
    );
    return null;
  }

  const variants: string[] = [];
  collectNames(root.x400s, variants);

  const titles: string[] = [];
  collectTitles(root.titles, titles);

  let birthYear = Number.parseInt(asText(root.birthDate), 10);

  if (!Number.isFinite(birthYear)) {
    const fromHeading = /(\d{3,4})\s*-/.exec(headings[0].text);
    birthYear = fromHeading ? Number.parseInt(fromHeading[1], 10) : Number.NaN;
  }

  return {
    id,
    headings,
    variants,
    titles,
    birthYear: Number.isFinite(birthYear) ? birthYear : null,
  };
}

// O VIAF oferece o registro completo em mais de um endereço; tenta um por vez
const CLUSTER_URLS = [
  (id: string) => `${VIAF_URL}/${id}/viaf.json`,
  (id: string) => `${VIAF_URL}/${id}`,
];

function getCluster(id: string): Promise<Cluster | null> {
  return cached(clusterCache, id, async () => {
    let lastError: unknown = null;

    for (const buildUrl of CLUSTER_URLS) {
      try {
        const cluster = parseCluster(id, await fetchJson(buildUrl(id)));
        if (cluster) return cluster;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) throw lastError;
    return null;
  });
}

// ---------------------------------------------------------------------------
// Comparação de nomes e validação de identidade
// ---------------------------------------------------------------------------

// Quebra em palavras sem acento, sem caixa e sem pontuação
function tokenize(text: string, keepNumbers = false): string[] {
  return text
    .replace(/\([^)]*\)/g, " ")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter((token) => token !== "" && (keepNumbers || !/^\d+$/.test(token)));
}

// O nome da API corresponde ao cabeçalho? Aceita a mesma lista de palavras em
// qualquer ordem, ou um cabeçalho menor contido no nome da API (ex.: a API traz
// "Joaquim Maria Machado de Assis" e o registro é "Assis, Machado de").
// O contrário (API menor que o registro) NÃO é aceito: é arriscado demais.
function sameName(apiTokens: string[], headingTokens: string[]): boolean {
  const api = new Set(apiTokens);
  const heading = new Set(headingTokens);

  if (api.size === 0 || heading.size === 0) return false;
  if (![...heading].every((token) => api.has(token))) return false;
  if (heading.size === api.size) return true;

  return [...heading].filter((token) => !PARTICLES.has(token)).length >= 2;
}

function clusterMatchesName(cluster: Cluster, apiTokens: string[]): boolean {
  const names = [...cluster.headings.map((item) => item.text), ...cluster.variants];

  return names.some((name) => sameName(apiTokens, tokenize(name)));
}

// Um autor não pode ter nascido depois da publicação do livro
function isPlausible(cluster: Cluster, publicationYear?: number | null) {
  if (!publicationYear || cluster.birthYear === null) return true;

  return cluster.birthYear <= publicationYear;
}

function hasTitleEvidence(cluster: Cluster, bookTitle?: string): boolean {
  const wanted = tokenize(bookTitle ?? "", true).join(" ");

  if (wanted.length < 4) return false;

  return cluster.titles.some((title) => {
    const known = tokenize(title, true).join(" ");

    return (
      known.length >= 4 &&
      (known === wanted || known.includes(wanted) || wanted.includes(known))
    );
  });
}

// ---------------------------------------------------------------------------
// Extração do sobrenome a partir do cabeçalho autorizado
// ---------------------------------------------------------------------------

// "Assis, Machado de, 1839-1908" -> { surname: "Assis", rest: "Machado de" }
// Cabeçalho sem vírgula (ex.: "Machado de Assis, 1839-1908") não está invertido
// e, portanto, não diz onde está o sobrenome: devolve null.
function parseHeading(text: string): ParsedHeading | null {
  let clean = normalizeName(text);

  clean = clean.replace(/\s*\([^)]*\)\s*$/, "");
  clean = clean.replace(
    /[\s,]*(?:(?:b|d|fl|ca)\.?\s*)?\d{3,4}\??(?:\s*-\s*(?:\d{3,4}\??)?)?\s*\.?\s*$/i,
    "",
  );
  clean = clean.replace(/[\s,]+$/, "");

  const commaIndex = clean.indexOf(",");

  if (commaIndex <= 0) return null;

  const surname = clean.slice(0, commaIndex).trim();
  const rest = clean.slice(commaIndex + 1).trim();

  if (!/\p{L}/u.test(surname) || !/\p{L}/u.test(rest)) return null;

  return { surname, rest };
}

// Escolhe o cabeçalho pela ordem de preferência das fontes, usando o primeiro
// que esteja invertido (com sobrenome identificável).
function pickHeading(cluster: Cluster): Pick | null {
  for (const source of SOURCE_PRIORITY) {
    for (const heading of cluster.headings) {
      if (!heading.sources.includes(source)) continue;

      const parsed = parseHeading(heading.text);
      if (parsed) return { ...parsed, source };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Padronização
// ---------------------------------------------------------------------------

function nameKey(name: string): string {
  return tokenize(name).sort().join(" ");
}

// Autores já cadastrados no padrão: são decisões anteriores do bibliotecário
function buildKnownIndex(knownAuthors: string[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const author of knownAuthors) {
    if (!isCatalogFormat(author)) continue;

    const key = nameKey(author);
    if (key && !index.has(key)) index.set(key, normalizeName(author));
  }

  return index;
}

function review(original: string, note: string): StandardizedAuthor {
  console.info(`[autoridade] "${original}" -> conferir: ${note}`);

  return { original, name: original, confirmed: false, source: null, note };
}

async function standardizeOne(
  original: string,
  options: StandardizeOptions,
  known: Map<string, string>,
): Promise<StandardizedAuthor> {
  const name = normalizeName(original);

  if (!name) return review(original, "nome vazio");

  // 1) Já está no padrão (também garante que reprocessar não estraga o nome)
  if (isCatalogFormat(name)) {
    return {
      original,
      name,
      confirmed: true,
      source: "já no padrão",
      note: "nome já estava no padrão",
    };
  }

  // 2) Já cadastrado antes no padrão
  const knownName = known.get(nameKey(name));

  if (knownName) {
    console.info(`[autoridade] "${name}" -> "${knownName}" (acervo local)`);

    return {
      original,
      name: knownName,
      confirmed: true,
      source: "acervo local",
      note: "autor já cadastrado no padrão",
    };
  }

  // 3) Registros de autoridade (VIAF)
  try {
    const ids = await searchCandidateIds(name);

    if (ids.length === 0) return review(name, "nenhum registro encontrado");

    const clusters = await Promise.all(
      ids.map((id) => getCluster(id).catch(() => null)),
    );

    const apiTokens = tokenize(name);

    let matches = clusters.filter(
      (cluster): cluster is Cluster =>
        cluster !== null &&
        clusterMatchesName(cluster, apiTokens) &&
        isPlausible(cluster, options.publicationYear),
    );

    if (matches.length === 0) {
      return review(name, "nenhum registro corresponde a este nome");
    }

    // Vários candidatos: o título do livro ajuda a escolher o autor certo
    if (matches.length > 1) {
      const withTitle = matches.filter((cluster) =>
        hasTitleEvidence(cluster, options.bookTitle),
      );

      if (withTitle.length > 0) matches = withTitle;
    }

    const picks = matches.map((cluster) => ({
      cluster,
      pick: pickHeading(cluster),
    }));

    if (picks.some((item) => item.pick === null)) {
      return review(
        name,
        "registro sem cabeçalho invertido nas fontes de referência",
      );
    }

    // Candidatos diferentes só são aceitos se resultarem no mesmo nome final
    const formatted = new Set(
      picks.map(({ pick }) => formatCatalogName(pick!.surname, pick!.rest)),
    );

    if (formatted.size !== 1) {
      return review(name, "mais de um autor possível (homônimos)");
    }

    const { cluster, pick } = picks[0];
    const result = formatCatalogName(pick!.surname, pick!.rest);

    console.info(
      `[autoridade] "${name}" -> "${result}" (fonte ${pick!.source}, VIAF ${cluster.id})`,
    );

    return {
      original,
      name: result,
      confirmed: true,
      source: pick!.source,
      note: `VIAF ${cluster.id}`,
    };
  } catch (error) {
    console.warn("Falha ao consultar o VIAF:", error);

    return review(name, "não foi possível consultar o VIAF");
  }
}

export async function standardizeAuthors(
  authors: string[],
  options: StandardizeOptions = {},
): Promise<StandardizedAuthor[]> {
  const known = buildKnownIndex(options.knownAuthors ?? []);

  return Promise.all(
    authors.map((author) => standardizeOne(author, options, known)),
  );
}
