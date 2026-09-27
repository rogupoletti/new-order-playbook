import { getAuthenticatedUser, json } from "./_lib/auth.js";

const PUBLIC_PATHS = new Set(["/login", "/api/login"]);

function securedResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store, private");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const isApi = url.pathname.startsWith("/api/");

  if (PUBLIC_PATHS.has(url.pathname)) return securedResponse(await context.next());

  let user;
  try {
    user = await getAuthenticatedUser(context.request, context.env);
  } catch (error) {
    console.error("Authentication configuration error", error);
    return securedResponse(isApi
      ? json({ error: "Serviço indisponível." }, { status: 503 })
      : new Response("Serviço indisponível.", { status: 503 }));
  }

  if (!user) {
    if (isApi) return securedResponse(json({ error: "Não autenticado." }, { status: 401 }));
    return securedResponse(Response.redirect(new URL("/login", context.request.url), 302));
  }

  if ((url.pathname === "/admin/users" || url.pathname.startsWith("/api/admin/")) && user.role !== "admin") {
    return securedResponse(isApi
      ? json({ error: "Sem permissão." }, { status: 403 })
      : new Response("Sem permissão.", { status: 403 }));
  }

  context.data.user = user;
  return securedResponse(await context.next());
}
