# 🐯 Calculadora de Troca — TigrãoImports

Ferramenta interna para calcular orçamentos de troca de iPhone.

---

## Deploy na Vercel (passo a passo)

### 1. Criar conta GitHub
Acesse https://github.com e crie uma conta gratuita.

### 2. Criar repositório
- Clique em **New repository**
- Nome: `tigrao-calculadora`
- Marque **Public**
- Clique em **Create repository**

### 3. Fazer upload dos arquivos
- Na página do repositório, clique em **uploading an existing file**
- Arraste TODOS os arquivos e pastas deste ZIP
- Clique em **Commit changes**

### 4. Deploy na Vercel
- Acesse https://vercel.com e clique em **Sign up with GitHub**
- Clique em **Add New Project**
- Selecione o repositório `tigrao-calculadora`
- Vercel detecta Vite automaticamente — clique em **Deploy**
- Em ~1 minuto você recebe a URL: `tigrao-calculadora.vercel.app`

---

## Atualizar preços

### Pelo app (recomendado)
Acesse a aba **💰 Preços** no app e edite diretamente.
Clique em **Salvar alterações** — atualiza na hora.

### Via GitHub (para mudanças estruturais)
1. Abra o arquivo `src/Root.jsx` no GitHub
2. Clique no ícone de lápis (editar)
3. Localize `NOVOS_DEFAULT` e edite os valores
4. Clique em **Commit changes**
5. Vercel republica automaticamente em ~1 minuto

---

## Rodar localmente (opcional)

```bash
npm install
npm run dev
```

Acesse http://localhost:5173
