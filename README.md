# Missão Bigode: O Detetive dos Sinais

Jogo educativo em português sobre a saúde dos gatos. O jogador é um detetive felino que investiga 13 casos, separa pistas de pegadinhas e decide quando procurar o veterinário, antes que O Silencioso apague os sinais.

- História ilustrada e narrada, com legendas
- 13 casos com três cômodos, tempo, comparação com a foto de 30 dias e quadro de pistas
- Diário, medalhas, plantão de emergência, rotina do tutor e guia "Quando procurar o veterinário"
- Funciona no celular, sem cadastro. O progresso fica só no aparelho
- Pode ser instalado e jogado sem internet

> O jogo orienta, mas não substitui a consulta com um médico-veterinário.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `site/` | O jogo, pronto para publicar. Não precisa de build |
| `site/dados.js` | Casos, pistas, perguntas e textos |
| `site/roteiro.js` | Cenas da história e falas |
| `site/motor.js` | Funcionamento do jogo. No topo fica a personalização para clínicas (`CLINICA`) |
| `site/img/`, `site/voz/` | Artes e narração |
| `site/_headers` | Cache e segurança na Cloudflare |
| `wrangler.jsonc` | Configuração da Cloudflare |

## Rodar no computador

```bash
npx serve site
```

## Publicar

### 1. GitHub

Crie um repositório vazio em https://github.com/new (sem README) e, dentro desta pasta:

```bash
git remote add origin https://github.com/SEU-USUARIO/missao-bigode.git
```

```bash
git push -u origin main
```

### 2. Cloudflare

1. Em https://dash.cloudflare.com, abra **Workers & Pages**, escolha **Create** e conecte o repositório do GitHub.
2. Confira os campos:
   - **Project name:** `missao-bigode`
   - **Build command:** deixe vazio
   - **Deploy command:** `npx wrangler deploy`
3. Salve. Cada novo envio para o GitHub publica sozinho.
4. O endereço `missao-bigode.SEU-SUBDOMINIO.workers.dev` aparece ao final. Para usar um domínio próprio, abra **Settings > Domains & Routes**.

Se preferir **Pages**, deixe o build vazio e use `site` como pasta de saída (*build output directory*).

### Sem GitHub

```bash
npx wrangler login
```

```bash
npx wrangler deploy
```

## Créditos

- Artes geradas por IA e dirigidas por quem criou o projeto.
- Narração sintética com o modelo aberto Kokoro-82M, vozes Santa e Dora.
- Música e efeitos gerados pelo próprio jogo.

Todos os direitos reservados. Para usar ou adaptar o conteúdo, peça autorização.
