# Balancete Consolidador

Uma aplicação web para consolidação e análise de balancetes contábeis.

## 🚀 Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ 
- npm

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/balancete-consolidador.git
cd balancete-consolidador
```

2. Instale as dependências:
```bash
npm install
```

## 🚀 Desenvolvimento

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🏗️ Build

Para produção:
```bash
npm run build
```

## 📦 Deploy no Vercel

1. Faça push do código para o GitHub
2. Conecte seu repositório no [Vercel](https://vercel.com)
3. O Vercel detectará automaticamente que é um projeto React
4. Configure as variáveis de ambiente (se necessário)
5. Deploy automático!

### Configurações de Deploy

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run check` - Verificação de tipos TypeScript
- `npm run format` - Formatação do código

## 📝 Estrutura do Projeto

```
├── client/                 # Código fonte do frontend
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── lib/           # Utilitários
│   │   └── ...
├── public/                # Arquivos estáticos
├── package.json
├── vite.config.ts
└── README.md
```

## 📄 Licença

MIT License
