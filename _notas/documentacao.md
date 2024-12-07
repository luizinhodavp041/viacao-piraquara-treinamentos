Claro! Vou fazer uma documentação detalhada do projeto LMS.

# Documentação do Projeto LMS

## Visão Geral

Sistema de Gerenciamento de Aprendizagem (LMS) corporativo focado em treinamentos internos, com gestão de cursos, módulos, aulas e progresso dos alunos.

## Stack Tecnológica

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Context API

### Backend

- Next.js API Routes
- MongoDB
- Mongoose
- JWT
- bcryptjs

### Armazenamento

- Cloudinary (vídeos)

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/         # Rotas de autenticação
│   ├── admin/          # Painel administrativo
│   └── home/           # Área do aluno
├── components/
│   ├── ui/            # Componentes base (shadcn)
│   ├── common/        # Componentes compartilhados
│   ├── forms/         # Componentes de formulário
│   └── layouts/       # Layouts reutilizáveis
├── contexts/
├── lib/
│   ├── auth/          # Utilitários de autenticação
│   ├── db/           # Configuração do MongoDB
│   └── utils/        # Funções utilitárias
├── models/           # Modelos MongoDB
├── hooks/            # Custom hooks
├── services/         # Lógica de negócios
└── types/           # Types TypeScript
```

## Roadmap e Status

### ✅ Fase 1 - Setup Inicial

- [x] Criar projeto Next.js
- [x] Configurar Tailwind e shadcn/ui
- [x] Estruturar pastas
- [x] Conectar MongoDB

### ✅ Fase 2 - Autenticação

- [x] Sistema de login
- [x] Painel admin
- [x] Criação de usuários
- [x] Proteção de rotas

### ✅ Fase 3 - Estrutura de Cursos

- [x] CRUD de cursos
- [x] CRUD de módulos
- [x] CRUD de aulas
- [x] Integração com Cloudinary

### ✅ Fase 4 - Interface do Aluno

- [x] Lista de cursos
- [x] Página do curso
- [x] Player de vídeo personalizado
- [x] Sistema de progresso

### ✅ Fase 5 - Painel Administrativo

- [x] Dashboard com métricas
- [x] Gestão de alunos
- [x] Monitoramento de progresso
- [x] Relatórios básicos

### 🔄 Em Desenvolvimento - Fase 6 - Sistema de Quiz

- [ ] CRUD de quizzes
- [ ] Múltipla escolha
- [ ] Verdadeiro/Falso
- [ ] Sistema de pontuação
- [ ] Feedback imediato

### ⏳ Planejado - Fase 7 - Certificados

- [ ] Geração automática
- [ ] Template personalizado
- [ ] QR Code para validação
- [ ] Sistema de validação

## Funcionalidades Principais

### Autenticação

- Login com email e senha
- Proteção de rotas
- Níveis de acesso (admin/aluno)

### Administração de Cursos

- Criação e gestão de cursos
- Organização em módulos
- Upload de vídeos via Cloudinary
- Ordenação de conteúdo

### Interface do Aluno

- Dashboard personalizado
- Progresso dos cursos
- Player de vídeo customizado
- Marcação de progresso automática

### Painel Administrativo

- Métricas gerais
- Gestão de usuários
- Acompanhamento de progresso
- Relatórios de desempenho

## Modelos de Dados

### User

```typescript
{
  name: string;
  email: string;
  password: string;
  role: "admin" | "student";
  status: "active" | "inactive";
}
```

### Course

```typescript
{
  title: string;
  description: string;
  modules: Module[];
}
```

### Module

```typescript
{
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  course: Course;
}
```

### Lesson

```typescript
{
  title: string;
  description: string;
  videoPublicId: string;
  order: number;
  module: Module;
}
```

### Progress

```typescript
{
  user: User;
  course: Course;
  lesson: Lesson;
  completed: boolean;
  lastWatched: Date;
}
```

## Próximos Passos

### Curto Prazo

1. Implementar sistema de quiz
2. Desenvolver geração de certificados
3. Melhorar relatórios administrativos

### Médio Prazo

1. Sistema de notificações
2. Gamificação
3. Fórum de discussão

### Longo Prazo

1. App mobile
2. Integração com outros LMS
3. Sistema de avaliação por pares

## Recursos Técnicos Utilizados

- Server Components do Next.js
- API Routes para backend
- Middleware para proteção de rotas
- Context API para gerenciamento de estado
- MongoDB com Mongoose para banco de dados
- JWT para autenticação
- Cloudinary para gerenciamento de vídeos
- shadcn/ui para interface

Quer que eu detalhe mais alguma parte específica da documentação?

Vou listar os principais arquivos e suas funções:

## Arquivos de Configuração

1. `src/lib/db/mongodb.ts`

```typescript
// Configuração de conexão com MongoDB
// Gerencia cache de conexão para evitar múltiplas conexões
// Usa variáveis de ambiente para configuração
```

2. `.env`

```env
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## Arquivos de Autenticação

1. `src/lib/auth/auth.ts`

```typescript
// Funções de autenticação
// Gerenciamento de tokens JWT
// Funções: encrypt, decrypt, login, logout, getSession
```

2. `src/middleware.ts`

```typescript
// Proteção de rotas
// Redirecionamentos baseados em autenticação
// Controle de acesso admin/student
```

## Modelos de Dados

1. `src/models/User.ts`

```typescript
// Modelo de usuário
// Campos: name, email, password, role
// Métodos de validação e índices
```

2. `src/models/Course.ts`

```typescript
// Modelo de curso
// Relacionamento com módulos
// Campos: title, description, modules
```

3. `src/models/Module.ts`

```typescript
// Modelo de módulo
// Relacionamento com curso e aulas
// Campos: title, description, order, lessons
```

4. `src/models/Lesson.ts`

```typescript
// Modelo de aula
// Relacionamento com módulo
// Campos: title, description, videoPublicId, order
```

5. `src/models/Progress.ts`

```typescript
// Modelo de progresso
// Rastreia progresso do aluno
// Campos: user, course, lesson, completed, lastWatched
```

## Rotas da API

1. `src/app/api/auth/login/route.ts`

```typescript
// Autenticação de usuários
// Validação de credenciais
// Geração de token JWT
```

2. `src/app/api/courses/route.ts`

```typescript
// CRUD de cursos
// GET: Lista cursos
// POST: Cria novo curso
```

3. `src/app/api/modules/route.ts`

```typescript
// CRUD de módulos
// Gerenciamento de ordem
// Relacionamento com curso
```

4. `src/app/api/lessons/route.ts`

```typescript
// CRUD de aulas
// Upload de vídeos
// Gerenciamento de ordem
```

5. `src/app/api/progress/route.ts`

```typescript
// Gerenciamento de progresso
// Marcação de aulas completadas
// Rastreamento de último acesso
```

## Componentes Principais

1. `src/components/video/video-player.tsx`

```typescript
// Player de vídeo customizado
// Integração com Cloudinary
// Controles personalizados
// Rastreamento de progresso
```

2. `src/components/layouts/admin-nav.tsx`

```typescript
// Navegação do painel admin
// Menu responsivo
// Controle de rotas ativas
```

3. `src/app/admin/dashboard/page.tsx`

```typescript
// Dashboard administrativo
// Métricas e estatísticas
// Visão geral do sistema
```

4. `src/app/home/courses/[courseId]/page.tsx`

```typescript
// Página de visualização do curso
// Lista de módulos e aulas
// Player de vídeo
// Progresso do aluno
```

## Utilitários

1. `src/lib/utils/onedrive.ts`

```typescript
// Funções para manipulação de URLs do Cloudinary
// Validação de URLs
// Geração de URLs de embed
```

2. `src/contexts/auth-context.tsx`

```typescript
// Contexto de autenticação
// Gerenciamento de estado do usuário
// Funções de login/logout
```

Cada arquivo tem um propósito específico e trabalha em conjunto para formar o sistema completo. Quer que eu detalhe algum arquivo específico ou mostre mais alguma parte do sistema?
