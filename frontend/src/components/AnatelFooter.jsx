import React from 'react';

const AnatelFooter = () => {
  return (
    <footer className="w-full mt-auto" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Corpo do footer */}
      <div style={{ backgroundColor: '#071D41' }} className="w-full pt-10 pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Identidade */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="6" fill="rgba(255,255,255,0.12)"/>
                  <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="800" fontFamily="Arial, sans-serif">ANA</text>
                  <text x="50" y="77" textAnchor="middle" fill="#FFCD07" fontSize="13" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="2">TEL</text>
                </svg>
                <div>
                  <p className="text-white font-bold text-base leading-tight">Anatel</p>
                  <p className="text-blue-300 text-[10px]">Agência Nacional de Telecomunicações</p>
                </div>
              </div>
              <p className="text-blue-300 text-xs leading-relaxed">
                Vinculada ao Ministério das Comunicações. Responsável pela regulação, fiscalização e controle das telecomunicações no Brasil.
              </p>
            </div>

            {/* Serviços */}
            <div>
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Serviços</h3>
              <ul className="space-y-2">
                {['Consulta de Taxas FISTEL', 'Pagamento de Débitos', 'Homologação de Equipamentos', 'Outorga de Serviços', 'Fiscalização Online'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-blue-300 text-xs hover:text-white transition-colors hover:underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informações */}
            <div>
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Informações</h3>
              <ul className="space-y-2">
                {['Sobre a Anatel', 'Legislação', 'Regulamentação', 'Transparência', 'Notícias'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-blue-300 text-xs hover:text-white transition-colors hover:underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Atendimento */}
            <div>
              <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Atendimento</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#FFCD07] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white text-xs font-bold">0800 728 9998</span>
                </li>
                {['Fale Conosco', 'Ouvidoria', 'Canais de Atendimento', 'Carta de Serviços'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-blue-300 text-xs hover:text-white transition-colors hover:underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-blue-400 text-xs text-center md:text-left">
                Todo o conteúdo deste site está publicado sob a licença{' '}
                <a href="#" className="text-blue-300 hover:text-white underline">Creative Commons Atribuição 3.0</a>
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png"
                  alt="gov.br"
                  className="h-4"
                  style={{ filter: 'brightness(0) invert(0.6)' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <span className="text-blue-300 font-bold text-xs">www.gov.br/anatel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AnatelFooter;
