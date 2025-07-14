# Planejamento Completo para Melhorias e Correções do Site de Anúncios

> **Importante:**  
> Todo o armazenamento de dados do site é feito no banco de dados Supabase. Não usamos local storage para salvar dados permanentes, garantindo segurança, consistência e sincronização entre usuários.

---

## Parte 1 - Correções Importantes no Site Atual

### 1. Anúncios Criados Não Aparecem na Aba “Contas”

**Fluxo Atual:**  
Usuário cria anúncio → Dados são enviados e armazenados no Supabase → Sistema confirma criação → Anúncio não aparece na aba “Contas” (que busca anúncios do Supabase)

**Correção e Caminho:**  
- Verificar se o registro do anúncio está sendo corretamente inserido na tabela de anúncios do Supabase.  
- Conferir se a query que busca anúncios para exibir na aba “Contas” está correta e atualizada.  
- Garantir que o frontend refaça a consulta ao Supabase após criação para atualizar a lista.  
- Evitar cache local no frontend que impeça a atualização.

---

### 2. Organização e Exibição das Categorias de Jogos

**Problema:** Muitas categorias e jogos armazenados no Supabase aparecem mal organizados no frontend.

**Solução Proposta:**  
- Consultar no Supabase todas as categorias e jogos.  
- Implementar barra lateral (menu accordion) ou mega menu para navegação organizada.  
- Utilizar paginação ou carregamento progressivo via chamadas ao Supabase para evitar sobrecarga.  
- Permitir busca filtrada via query dinâmica ao Supabase.

---

### 3. Permissão de Admin para Email calilfellipee@outlook.com

**Caminho para resolver:**  
- Atualizar no banco Supabase a tabela de usuários, atribuindo permissão admin ao email citado.  
- Pode ser feito pelo painel Supabase na tabela `users` ou via query SQL.  
- Confirmar no frontend que a permissão admin está respeitada para liberar recursos.

---

### 4. Destaques do Dia Não Atualizam com Anúncios Reais

**Problema:** Destaques puxam anúncios estáticos, não dados do Supabase.

**Solução:**  
- Alterar query para buscar anúncios recentes ou mais visualizados na tabela do Supabase.  
- Atualizar frontend para consumir dados dinâmicos via API do Supabase.  
- Programar refresh periódico para atualizar dados de destaque.

---

### 5. Site Para de Funcionar Após Uso Prolongado

**Problema:** Após certo tempo, frontend para de carregar dados do Supabase.

**Possíveis Causas:**  
- Falha na conexão ou limite de requisições à API do Supabase.  
- Vazamento de memória no frontend.  
- Falta de tratamento adequado de erros nas chamadas ao Supabase.

**Plano de Ação:**  
- Implementar tratamento e retry de erros nas chamadas.  
- Monitorar performance e uso de memória no frontend.  
- Verificar e otimizar queries ao Supabase para evitar sobrecarga.

---

## Parte 2 - Novas Funcionalidades para Enriquecer o Site (com Supabase como backend)

---

### 1. Filtro Avançado de Busca

**Fluxo:**  
Usuário seleciona filtros → Frontend gera query dinâmica → Consulta o Supabase com filtros → Recebe e exibe resultados atualizados.

---

### 2. Sistema de Avaliação e Comentários

**Fluxo:**  
Após compra confirmada, usuário submete avaliação → Dados gravados em tabela `reviews` no Supabase → Comentários exibidos via consulta.

---

### 3. Chat em Tempo Real

**Fluxo:**  
Usuários trocam mensagens → Usam Supabase Realtime para enviar/receber → Mensagens armazenadas em `chats` no Supabase.

---

### 4. Notificações Push

**Fluxo:**  
Eventos no backend → Notificações são enviadas via serviço de push → Usuários recebem alertas.

---

### 5. Sistema de Favoritos

**Fluxo:**  
Usuário salva anúncio → Registro salvo na tabela `favorites` no Supabase → Lista atualizada via consulta.

---

### 6. Dashboard para Vendedores

**Fluxo:**  
Vendedor acessa dashboard → Consulta dados (anúncios, vendas, saldo) no Supabase → Pode editar anúncios via CRUD no Supabase.

---

### 7. Pagamentos Seguros via Escrow

**Fluxo:**  
Compra realizada → Transação gravada no Supabase com status `escrow` → Após entrega confirmada, status atualizado → Transferência via Stripe Connect acionada.

---

### 8. Histórico de Transações

**Fluxo:**  
Usuário consulta histórico → Dados consultados diretamente da tabela `transactions` no Supabase.

---

### 9. Busca por Voz

**Fluxo:**  
Input por voz → Termo enviado para busca → Consulta no Supabase → Resultados exibidos.

---

### 10. Multi-idiomas

**Fluxo:**  
Seleção de idioma → Conteúdos fixos trocados → Dados dinâmicos consultados no Supabase com suporte a múltiplos idiomas (se aplicável).

---

### 11. Sistema de Cupons e Descontos

**Fluxo:**  
Admin cria cupons → Gravados em tabela no Supabase → Usuário aplica cupom no checkout → Validação no backend via Supabase.

---

### 12. Integração com Redes Sociais

**Fluxo:**  
Usuário compartilha → URL do anúncio é gerada e pode ser postada → Anúncio carregado consultando Supabase.

---

### 13. Paginação ou Scroll Infinito

**Fluxo:**  
Ao rolar página → Novos dados são consultados no Supabase → Renderizados dinamicamente.

---

### 14. Sistema de Recomendações

**Fluxo:**  
Baseado em histórico armazenado no Supabase → Algoritmo gera recomendações → Exibe no frontend.

---

### 15. Relatórios e Estatísticas para Admin

**Fluxo:**  
Admin acessa painel → Dados coletados e processados via consultas ao Supabase → Visualizados em dashboards.

---

### 16. Validação e Verificação de Vendedores

**Fluxo:**  
Documentação enviada → Dados atualizados no Supabase → Admin valida → Status do vendedor atualizado.

---

### 17. Sistema de Denúncias e Moderação

**Fluxo:**  
Usuário denuncia → Registro salvo no Supabase → Admin revisa e age.

---

### 18. Modo Escuro (Dark Mode)

**Fluxo:**  
Preferência salva no Supabase (usuário logado) ou local storage → Interface aplica tema conforme.

---

### 19. Mobile Friendly / PWA

**Fluxo:**  
Frontend responsivo → Dados consultados no Supabase → Usuário pode instalar como app.

---

### 20. Backup Automático e Monitoramento

**Fluxo:**  
Supabase realiza backups automáticos → Logs e métricas monitoradas → Alertas configurados para erros.

---

# Considerações Finais

- Todas as interações e dados do site dependem do banco Supabase para manter consistência, segurança e escalabilidade.  
- Evite usar local storage para armazenar dados permanentes, somente para cache temporário ou estado local que não comprometa dados importantes.  
- Garanta que o frontend faça consultas eficientes e trate erros da API Supabase para manter boa experiência.

---

Quer ajuda para implementar algum fluxo específico usando Supabase?  
Posso te ajudar com exemplos de queries, funções, API, e frontend integrados.  
É só pedir! 🚀
