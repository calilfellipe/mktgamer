import React from 'react';
import { 
  Gamepad2, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">GameMarket</span>
            </div>
            <p className="text-gray-400 mb-4">
              A maior plataforma de compra e venda de contas, skins e serviços gamers do Brasil.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">suporte@gamemarket.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">(11) 9999-9999</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">São Paulo, SP</span>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-white font-semibold mb-4">Segurança</h3>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="text-gray-400">SSL Certificado</span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Pagamentos seguros via:</p>
              <div className="flex space-x-2">
                <div className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-300">PIX</div>
                <div className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-300">Cartão</div>
                <div className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-300">PayPal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 GameMarket. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Política de Cookies
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              LGPD
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}