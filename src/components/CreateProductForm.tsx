import React, { useState } from 'react';
import { 
  Upload, 
  Image, 
  DollarSign, 
  Tag, 
  Clock, 
  Star,
  Gamepad2,
  Save,
  Eye,
  Zap,
  TrendingUp,
  Award,
  X
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { games } from '../data/mockData';

export function CreateProductForm() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    game: '',
    price: '',
    rarity: '',
    level: '',
    delivery_time: '1',
    commission_rate: 10
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você precisa estar logado para criar um anúncio.</p>
        </div>
      </div>
    );
  }

  const categories = [
    { 
      id: 'account', 
      name: '🎮 Conta de Jogo', 
      description: 'Contas de jogos com progressão, skins e itens',
      icon: '🎮'
    },
    { 
      id: 'skin', 
      name: '✨ Skin', 
      description: 'Skins raras e exclusivas para seus jogos favoritos',
      icon: '✨'
    },
    { 
      id: 'giftcard', 
      name: '🎁 Gift Card', 
      description: 'Cartões presente para plataformas de jogos',
      icon: '🎁'
    },
    { 
      id: 'service', 
      name: '🚀 Serviço Gamer', 
      description: 'Boost, coaching e outros serviços especializados',
      icon: '🚀'
    }
  ];

  const rarities = [
    { id: 'common', name: 'Comum', color: 'text-gray-400' },
    { id: 'uncommon', name: 'Incomum', color: 'text-green-400' },
    { id: 'rare', name: 'Raro', color: 'text-blue-400' },
    { id: 'epic', name: 'Épico', color: 'text-purple-400' },
    { id: 'legendary', name: 'Lendário', color: 'text-yellow-400' },
    { id: 'mythic', name: 'Mítico', color: 'text-red-400' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > 10) {
      setMessage('❌ Máximo 10 imagens permitidas');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ Arquivo muito grande. Máximo 5MB por imagem.');
        return false;
      }
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const commission = (price * formData.commission_rate) / 100;
    return price - commission;
  };

  const getCommissionBenefits = (rate: number) => {
    if (rate >= 20) return { level: 'Ultra Destaque', icon: '🌟', color: 'text-yellow-400' };
    if (rate >= 15) return { level: 'Super Destaque', icon: '⭐', color: 'text-purple-400' };
    if (rate >= 10) return { level: 'Destaque', icon: '✨', color: 'text-blue-400' };
    return { level: 'Padrão', icon: '🥉', color: 'text-gray-400' };
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.title || !formData.description || !formData.game || !formData.price || imagePreview.length === 0) {
      setMessage('❌ Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Criando produto...');
      
      // Use image previews as URLs (in a real app, you'd upload to storage)
      let imageUrls = imagePreview;

      // Calculate visibility score based on commission rate
      const visibility_score = Math.floor(formData.commission_rate * 10);

      // Create product in Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([{
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          game: formData.game,
          price: parseFloat(formData.price),
          images: imageUrls,
          rarity: formData.rarity || null,
          level: formData.level ? parseInt(formData.level) : null,
          delivery_time: parseInt(formData.delivery_time),
          commission_rate: formData.commission_rate,
          visibility_score,
          status: 'active' // Auto-approve for now
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar produto:', error);
        throw new Error(error.message);
      }

      console.log('✅ Produto criado com sucesso:', data);
      setMessage('✅ Anúncio criado com sucesso!');
      
      // Reset form
      setFormData({
        category: '',
        title: '',
        description: '',
        game: '',
        price: '',
        rarity: '',
        level: '',
        delivery_time: '1',
        commission_rate: 10
      });
      setSelectedImages([]);
      setImagePreview([]);
      setCurrentStep(1);
      
    } catch (error: any) {
      console.error('❌ Erro ao criar produto:', error);
      setMessage(`❌ ${error.message}`);
    }
    setIsLoading(false);
  };

  const steps = [
    { id: 1, name: 'Categoria', icon: Tag },
    { id: 2, name: 'Detalhes', icon: Gamepad2 },
    { id: 3, name: 'Imagens', icon: Image },
    { id: 4, name: 'Preço', icon: DollarSign },
    { id: 5, name: 'Revisão', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            ✨ Criar <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Anúncio</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Venda seus itens gamers com segurança e alcance milhares de compradores
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-white">{message}</p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-purple-500 bg-purple-500 text-white' :
                    isCompleted ? 'border-green-500 bg-green-500 text-white' :
                    'border-gray-600 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-purple-400' :
                    isCompleted ? 'text-green-400' :
                    'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          {/* Step 1: Category */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Escolha a Categoria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      formData.category === category.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    }`}
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-400">{category.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Detalhes do Produto</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título do Anúncio *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Conta Free Fire Elite com 50K Diamantes"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Jogo *
                  </label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="">Selecione o jogo</option>
                    {games.map(game => (
                      <option key={game.name} value={game.name}>
                        {game.icon} {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição Detalhada *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Descreva detalhadamente seu produto: itens inclusos, nível, skins, etc."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                    required
                  />
                </div>

                {formData.category === 'skin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Raridade
                    </label>
                    <select
                      name="rarity"
                      value={formData.rarity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Selecione a raridade</option>
                      {rarities.map(rarity => (
                        <option key={rarity.id} value={rarity.id}>
                          {rarity.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.category === 'account' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nível da Conta
                    </label>
                    <input
                      type="number"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      placeholder="Ex: 85"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tempo de Entrega (horas)
                  </label>
                  <select
                    name="delivery_time"
                    value={formData.delivery_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="1">Imediato (até 1 hora)</option>
                    <option value="6">Rápido (até 6 horas)</option>
                    <option value="24">Normal (até 24 horas)</option>
                    <option value="72">Personalizado (até 3 dias)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Imagens do Produto</h2>
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">Adicionar Imagens</h3>
                    <p className="text-gray-400 text-sm">
                      Clique para selecionar até 10 imagens (PNG, JPG, máx 5MB cada)
                    </p>
                  </label>
                </div>

                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreview.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Price */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Definir Preço e Taxa</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Taxa de Comissão: {formData.commission_rate}%
                  </label>
                  
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>5% - Básico</span>
                      <span>10% - Padrão</span>
                      <span>15% - Destaque</span>
                      <span>20% - Ultra</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getCommissionBenefits(formData.commission_rate).icon}</span>
                      <span className={`font-bold ${getCommissionBenefits(formData.commission_rate).color}`}>
                        {getCommissionBenefits(formData.commission_rate).level}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {formData.commission_rate >= 20 && (
                        <>
                          <div className="flex items-center space-x-2 text-yellow-400">
                            <Zap className="w-4 h-4" />
                            <span>Sempre no topo dos resultados</span>
                          </div>
                          <div className="flex items-center space-x-2 text-yellow-400">
                            <Star className="w-4 h-4" />
                            <span>Selo "Ultra Destaque"</span>
                          </div>
                        </>
                      )}
                      
                      {formData.commission_rate >= 15 && (
                        <div className="flex items-center space-x-2 text-purple-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>+200% de visibilidade</span>
                        </div>
                      )}
                      
                      {formData.commission_rate >= 10 && (
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Award className="w-4 h-4" />
                          <span>Aparece em "Destaques"</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {formData.price && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-white font-bold mb-4">Resumo Financeiro</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Preço de venda:</span>
                        <span className="text-white">R$ {parseFloat(formData.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Taxa da plataforma ({formData.commission_rate}%):</span>
                        <span className="text-red-400">-R$ {((parseFloat(formData.price) * formData.commission_rate) / 100).toFixed(2)}</span>
                      </div>
                      <hr className="border-gray-700" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Você recebe:</span>
                        <span className="text-green-400">R$ {calculateFinalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Revisar Anúncio</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    {imagePreview[0] && (
                      <img
                        src={imagePreview[0]}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="primary">{formData.game}</Badge>
                        <Badge variant="secondary">
                          {categories.find(c => c.id === formData.category)?.name}
                        </Badge>
                        {formData.rarity && (
                          <Badge variant="success">
                            {rarities.find(r => r.id === formData.rarity)?.name}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{formData.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{formData.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Entrega em {formData.delivery_time}h</span>
                          </div>
                          {formData.level && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>Nível {formData.level}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            R$ {parseFloat(formData.price || '0').toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Taxa: {formData.commission_rate}% • Você recebe: R$ {calculateFinalPrice().toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                  <h3 className="text-green-300 font-bold mb-2">✅ Tudo pronto!</h3>
                  <p className="text-green-400/70">
                    Seu anúncio será publicado imediatamente e ficará visível para milhares de compradores.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Voltar
            </Button>
            
            {currentStep < 5 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                disabled={
                  (currentStep === 1 && !formData.category) ||
                  (currentStep === 2 && (!formData.title || !formData.game || !formData.description)) ||
                  (currentStep === 3 && imagePreview.length === 0) ||
                  (currentStep === 4 && !formData.price)
                }
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Publicando...' : '🚀 Publicar Anúncio'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}