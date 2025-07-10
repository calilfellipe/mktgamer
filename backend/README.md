# GameMarket Backend

Backend completo para a plataforma GameMarket - marketplace gamer para compra e venda de contas, skins e serviços.

## 🚀 Tecnologias

- **Node.js** com Express.js
- **PostgreSQL** para dados persistentes
- **Redis** para cache e sessões
- **Stripe** para pagamentos
- **Socket.IO** para chat em tempo real
- **JWT** para autenticação
- **Bcrypt** para hash de senhas

## 📦 Instalação

1. Clone o repositório e navegue para a pasta backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco:
```bash
npm run migrate
```

5. Popule o banco com dados de exemplo:
```bash
npm run seed
```

6. Inicie o servidor:
```bash
npm run dev
```

## 🗄️ Estrutura do Banco

### Tabelas Principais

- **users**: Usuários da plataforma
- **products**: Produtos (contas, skins, etc.)
- **transactions**: Transações de compra/venda
- **plans**: Planos premium
- **subscriptions**: Assinaturas dos usuários

## 🔐 Autenticação

O sistema usa JWT tokens para autenticação. Inclua o token no header:

```
Authorization: Bearer <token>
```

## 📡 APIs Principais

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário
- `PATCH /api/auth/profile` - Atualizar perfil

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Detalhes do produto
- `PATCH /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Transações
- `POST /api/transactions` - Criar transação
- `GET /api/transactions/my` - Minhas transações
- `PATCH /api/transactions/:id/status` - Atualizar status

### Planos
- `GET /api/plans` - Listar planos
- `POST /api/plans/subscribe` - Assinar plano
- `POST /api/plans/cancel` - Cancelar assinatura

### Admin
- `GET /api/admin/dashboard` - Estatísticas
- `GET /api/admin/users` - Gerenciar usuários
- `PATCH /api/admin/users/:id/ban` - Banir usuário

## 💳 Pagamentos

Integração completa com Stripe para:
- Pagamentos únicos (produtos)
- Assinaturas recorrentes (planos)
- Webhooks para confirmação
- Sistema de escrow

## 🔄 Sistema de Escrow

1. Comprador faz o pagamento
2. Dinheiro fica retido na plataforma
3. Vendedor entrega o produto
4. Comprador confirma recebimento
5. Dinheiro é liberado para o vendedor

## 📊 Planos Premium

- **Grátis**: 5 anúncios, taxa 15%
- **Gamer**: R$29/mês, taxa 10%, +50% visibilidade
- **Pro Player**: R$59/mês, taxa 5%, anúncios em destaque
- **Elite**: R$99/mês, taxa 0%, sempre no topo

## 🔒 Segurança

- Rate limiting
- Validação de dados com Joi
- Hash de senhas com bcrypt
- Headers de segurança com helmet
- CORS configurado
- Sanitização de inputs

## 📱 WebSocket (Socket.IO)

Funcionalidades em tempo real:
- Chat entre comprador e vendedor
- Notificações de transações
- Updates de status em tempo real

## 🚀 Deploy

Para produção, configure:
- Variáveis de ambiente de produção
- SSL/HTTPS
- Proxy reverso (nginx)
- PM2 para gerenciamento de processos
- Backup automático do banco

## 📈 Monitoramento

- Logs estruturados com Morgan
- Health check endpoint: `/health`
- Métricas de performance
- Alertas de erro

## 🧪 Testes

```bash
# Executar testes
npm test

# Cobertura de código
npm run test:coverage
```

## 📝 Licença

Este projeto está sob a licença MIT.