import React from 'react';
import { Star, Shield } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'João Silva',
    username: '@joaosilva',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    rating: 5,
    text: 'Comprei minha conta do Free Fire aqui e foi perfeito! Entrega rápida e produto exatamente como descrito.',
    verified: true
  },
  {
    id: 2,
    name: 'Maria Santos',
    username: '@mariasantos',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    rating: 5,
    text: 'Vendendo aqui há 6 meses e nunca tive problemas. Plataforma segura e pagamentos em dia.',
    verified: true
  },
  {
    id: 3,
    name: 'Pedro Costa',
    username: '@pedrocosta',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    rating: 5,
    text: 'Melhor site para comprar skins do Valorant. Preços justos e atendimento excepcional.',
    verified: true
  }
];

export function Testimonials() {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O que nossos <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">usuários</span> dizem
          </h2>
          <p className="text-gray-400 text-lg">
            Mais de 10.000 gamers confiam na nossa plataforma
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <Shield className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{testimonial.username}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}