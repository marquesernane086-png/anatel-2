import React, { useState } from 'react';

const AnatelHeader = ({ breadcrumb = null }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full" style={{ fontFamily: "'Rawline', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Barra Superior Gov.br */}
      <div style={{ backgroundColor: '#071D41' }} className="w-full">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-3">
            <img
              src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png"
              alt="gov.br"
              className="h-5"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span
              className="text-white font-bold text-base hidden"
              style={{ display: 'none' }}
            >
              gov.br
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-300 hover:text-white text-xs font-medium transition-colors">
              Acessibilidade
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-xs font-medium transition-colors hidden sm:inline">
              Alto Contraste
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-xs font-medium transition-colors hidden sm:inline">
              VLibras
            </a>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo ANATEL */}
            <a href="/anatel" className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0">
              {/* Logo SVG oficial estilo ANATEL */}
              <div className="flex items-center gap-2">
                <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="6" fill="#003580"/>
                  <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-1">ANA</text>
                  <text x="50" y="77" textAnchor="middle" fill="#FFCD07" fontSize="13" fontFamily="Arial, sans-serif" letterSpacing="2" fontWeight="700">TEL</text>
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[#003580] font-extrabold text-xl tracking-tight">Anatel</span>
                  <span className="text-gray-500 text-[11px] font-medium hidden sm:block">Agência Nacional de Telecomunicações</span>
                </div>
              </div>
            </a>

            {/* Barra de Busca */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="O que você procura?"
                  className="w-full border border-gray-300 rounded-full py-2 px-5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:border-transparent transition-all"
                />
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1351B4] hover:text-[#003580] transition-colors"
                  aria-label="Buscar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-[#1351B4] p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navegação principal */}
      <div style={{ backgroundColor: '#1351B4' }} className="w-full">
        {/* Desktop nav */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 hidden md:flex">
          <nav className="flex items-stretch h-11" role="navigation">
            {['Consumidor', 'Outorgas', 'Homologação', 'Regulamentação', 'Fiscalização', 'Acesso à Informação'].map((item, i) => (
              <a
                key={item}
                href="#"
                className="flex items-center px-4 text-white text-sm font-medium hover:bg-[#0c3d91] transition-colors border-r border-white/20 whitespace-nowrap"
                style={{ borderLeft: i === 0 ? '1px solid rgba(255,255,255,0.2)' : undefined }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/20">
            {['Consumidor', 'Outorgas', 'Homologação', 'Regulamentação', 'Fiscalização', 'Acesso à Informação'].map(item => (
              <a
                key={item}
                href="#"
                className="block px-4 py-3 text-white text-sm font-medium hover:bg-[#0c3d91] border-b border-white/10 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="w-full bg-[#F8F8F8] border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap" aria-label="breadcrumb">
            <a href="/anatel" className="hover:text-[#1351B4] hover:underline transition-colors">Anatel</a>
            <span className="text-gray-400">/</span>
            <a href="#" className="hover:text-[#1351B4] hover:underline transition-colors">Outorgas e Homologações</a>
            <span className="text-gray-400">/</span>
            <span className="text-[#1351B4] font-semibold">
              {breadcrumb || 'Taxas e Débitos FISTEL'}
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default AnatelHeader;
