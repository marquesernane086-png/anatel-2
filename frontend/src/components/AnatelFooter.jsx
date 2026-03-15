import React from 'react';

const AnatelFooter = () => {
  return (
    <footer className="w-full bg-[#003580] text-white pt-10 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="8" fill="white" fillOpacity="0.15"/>
                <text x="50" y="62" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">ANA</text>
                <text x="50" y="80" textAnchor="middle" fill="#FFC72C" fontSize="11" fontFamily="Arial">TEL</text>
              </svg>
              <div className="flex flex-col">
                <span className="text-white font-bold text-[16px]">Anatel</span>
                <span className="text-blue-200 text-[11px]">Agência Nacional de Telecomunicações</span>
              </div>
            </div>
            <p className="text-blue-200 text-[12px] leading-relaxed">
              Agência reguladora das telecomunicações no Brasil, vinculada ao Ministério das Comunicações.
            </p>
          </div>

          {/* Serviços */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[15px] text-white">Serviços</h3>
            <ul className="space-y-2 text-[13px] text-blue-200">
              <li><a href="#" className="hover:text-white hover:underline transition-all">Consulta de Taxas FISTEL</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Pagamento de Débitos</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Homologação de Equipamentos</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Outorga de Serviços</a></li>
            </ul>
          </div>

          {/* Informações */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[15px] text-white">Informações</h3>
            <ul className="space-y-2 text-[13px] text-blue-200">
              <li><a href="#" className="hover:text-white hover:underline transition-all">Sobre a Anatel</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Legislação</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Regulamentação</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Transparência</a></li>
            </ul>
          </div>

          {/* Atendimento */}
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[15px] text-white">Atendimento</h3>
            <ul className="space-y-2 text-[13px] text-blue-200">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>0800 728 9998</span>
              </li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Fale Conosco</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Ouvidoria</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-all">Canais de Atendimento</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="w-full bg-[#002060] py-4 px-4 sm:px-8 text-[12px] text-blue-300">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span>Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição 3.0</span>
          <span className="font-bold text-white">www.gov.br/anatel</span>
        </div>
      </div>
    </footer>
  );
};

export default AnatelFooter;
