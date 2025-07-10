import React, { useState } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { id: 'account', name: '👤 Problemas com Conta', description: 'Login, senha, verificação' },
    { id: 'payment', name: '💳 Pagamentos', description: 'Problemas com transações' },
    { id: 'product', name: '📦 Produtos', description: 'Dúvidas sobre compras/vendas' },
    { id: 'technical', name: '🔧 Suporte Técnico', description: 'Bugs e problemas técnicos' },
    { id: 'other', name: '❓ Outros', description: 'Outras dúvidas' }
  ];

  const faqs = [
    {
      question: 'Como funciona o sistema de escrow?',
      answer: 'O sistema de escrow protege compradores e vendedores. O pagamento fica retido até a confirmação da entrega do produto.'
    },
    {
      question: 'Quanto tempo demora para verificar minha conta?',
      answer: 'A verificação de conta geralmente leva de 24 a 48 horas úteis após o envio dos documentos.'
    },
    {
      question: 'Posso cancelar uma compra?',
      answer: 'Sim, você pode cancelar uma compra antes da confirmação do vendedor. Após isso, será necessário acordo entre as partes.'
    },
    {
      question: 'Como denunciar um vendedor suspeito?',
      answer: 'Use o botão "Denunciar" no perfil do vendedor ou entre em contato conosco com evidências.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && message.trim()) {
      setIsSubmitted(true);
      // Here you would normally send the message to your support system
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Central de <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Suporte</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Estamos aqui para ajudar você 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Fale Conosco</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Chat ao Vivo</p>
                    <p className="text-gray-400 text-sm">Resposta imediata</p>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400 text-sm">suporte@progamermarket.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Telefone</p>
                    <p className="text-gray-400 text-sm">(11) 9999-9999</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Horário</p>
                    <p className="text-gray-400 text-sm">24 horas por dia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Perguntas Frequentes
              </h3>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="cursor-pointer text-white font-medium p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      {faq.question}
                    </summary>
                    <div className="mt-2 p-3 text-gray-400 text-sm bg-gray-800/50 rounded-lg">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Support Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              {!isSubmitted ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-6">Envie sua Mensagem</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Categoria do Problema
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categories.map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`text-left p-4 rounded-lg border transition-all ${
                              selectedCategory === category.id
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <p className="text-white font-medium mb-1">{category.name}</p>
                            <p className="text-gray-400 text-sm">{category.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descreva seu problema
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                        placeholder="Descreva detalhadamente seu problema para que possamos ajudar melhor..."
                        required
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prioridade
                      </label>
                      <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500">
                        <option value="low">🟢 Baixa - Dúvida geral</option>
                        <option value="medium">🟡 Média - Problema que afeta uso</option>
                        <option value="high">🔴 Alta - Problema crítico</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      icon={Send}
                      disabled={!selectedCategory || !message.trim()}
                    >
                      Enviar Mensagem
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-400 mb-6">
                    Recebemos sua mensagem e nossa equipe entrará em contato em breve.
                  </p>
                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-400 mb-2">Número do ticket:</p>
                    <p className="text-white font-mono">#PGM-{Date.now().toString().slice(-6)}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setSelectedCategory('');
                      setMessage('');
                    }}
                  >
                    Enviar Nova Mensagem
                  </Button>
                </div>
              )}
            </div>

            {/* Status Banner */}
            <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">Todos os sistemas operacionais</p>
                  <p className="text-green-400/70 text-sm">Última verificação: há 2 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}