import React from 'react';

const AnatelHeader = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Barra Gov.br */}
      <div className="bg-[#071D41] py-2 px-4 sm:px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png"
              alt="gov.br"
              className="h-[22px] brightness-0 invert"
            />
          </div>
          <div className="flex items-center gap-4 text-[12px] font-semibold text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Acessibilidade</a>
            <a href="#" className="hover:text-white transition-colors hidden sm:inline">Alto Contraste</a>
            <a href="#" className="hover:text-white transition-colors hidden sm:inline">VLibras</a>
          </div>
        </div>
      </div>

      {/* Header Principal ANATEL */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo ANATEL */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                  {/* ANATEL Logo SVG inline */}
                  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" rx="8" fill="#003580"/>
                    <text x="50" y="62" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">ANA</text>
                    <text x="50" y="80" textAnchor="middle" fill="#FFC72C" fontSize="11" fontFamily="Arial">TEL</text>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[#003580] text-[20px] font-extrabold leading-tight tracking-tight">
                      Anatel
                    </span>
                    <span className="text-[12px] text-gray-500 font-medium">
                      Agência Nacional de Telecomunicações
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Busca */}
            <div className="w-full md:w-auto flex flex-col gap-2">
              <div className="relative w-full md:w-[400px]">
                <input
                  type="text"
                  placeholder="O que você procura?"
                  className="w-full border border-gray-300 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] transition-all"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#003580] hover:text-blue-800 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação ANATEL */}
      <div className="w-full bg-[#003580] text-white hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <nav className="flex items-center gap-0 h-[48px] text-[14px] font-medium">
            <a href="#" className="hover:bg-[#002060] px-4 h-full flex items-center transition-colors border-r border-[#1a4a9a]">Consumidor</a>
            <a href="#" className="hover:bg-[#002060] px-4 h-full flex items-center transition-colors border-r border-[#1a4a9a]">Outorgas</a>
            <a href="#" className="hover:bg-[#002060] px-4 h-full flex items-center transition-colors border-r border-[#1a4a9a]">Homologação</a>
            <a href="#" className="hover:bg-[#002060] px-4 h-full flex items-center transition-colors border-r border-[#1a4a9a]">Regulamentação</a>
            <a href="#" className="hover:bg-[#002060] px-4 h-full flex items-center transition-colors border-r border-[#1a4a9a]">Fiscalização</a>
            <a href="#" className="hover:bg-[#002060] px-4 h-full flex items-center transition-colors">Acesso à Informação</a>
          </nav>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="w-full bg-[#F8F8F8] border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-2">
          <nav className="flex items-center gap-2 text-[12px] text-gray-600">
            <a href="#" className="hover:text-[#003580] hover:underline">Anatel</a>
            <span>/</span>
            <a href="#" className="hover:text-[#003580] hover:underline">Outorgas e Homologações</a>
            <span>/</span>
            <span className="text-[#003580] font-semibold">Taxas e Débitos FISTEL</span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AnatelHeader;
