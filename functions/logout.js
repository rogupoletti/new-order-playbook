const page = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sair | New Order Playbook</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f5f7fb; color: #152033; }
      main { width: min(100% - 32px, 430px); padding: 36px; background: #fff; border: 1px solid #d9e0ea; border-radius: 16px; box-shadow: 0 16px 48px rgba(21, 32, 51, .12); }
      h1 { margin: 0 0 12px; font-size: 1.5rem; }
      p { line-height: 1.5; }
      button, a { box-sizing: border-box; display: inline-block; padding: 12px 16px; border-radius: 8px; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
      button { border: 0; background: #0b65d8; color: #fff; }
      a { margin-left: 8px; color: #0b65d8; }
    </style>
  </head>
  <body>
    <main>
      <h1>Encerrar sessão</h1>
      <p>Você deseja sair do New Order Playbook?</p>
      <button id="logout" type="button">Sair</button>
      <a href="/">Cancelar</a>
    </main>
    <script>
      document.getElementById('logout').addEventListener('click', async () => {
        const button = document.getElementById('logout');
        button.disabled = true;
        button.textContent = 'Saindo…';
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
        window.location.assign('/login');
      });
    </script>
  </body>
</html>`;

export function onRequestGet() {
  return new Response(page, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}
