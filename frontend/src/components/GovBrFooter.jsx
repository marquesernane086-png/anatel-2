import React from 'react';

const GovBrFooter = () => {
  return (
    <footer className="w-full bg-[#003366] text-white pt-10 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <img 
              src="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png" 
              alt="gov.br" 
              className="h-[40px] brightness-0 invert"
            />
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[15px]">Serviços</h3>
            <ul className="space-y-2 text-[13px] text-gray-200">
              <li><a href="#" className="hover:underline transition-all">Buscar serviços</a></li>
              <li><a href="#" className="hover:underline transition-all">Serviços para MEI</a></li>
              <li><a href="#" className="hover:underline transition-all">Orçamento Nacional</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[15px]">Temas em Destaque</h3>
            <ul className="space-y-2 text-[13px] text-gray-200">
              <li><a href="#" className="hover:underline transition-all">Serviços para o cidadão</a></li>
              <li><a href="#" className="hover:underline transition-all">Economia e Gestão</a></li>
              <li><a href="#" className="hover:underline transition-all">Trabalho e Previdência</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-bold mb-4 text-[15px]">Navegação</h3>
            <ul className="space-y-2 text-[13px] text-gray-200">
              <li><a href="#" className="hover:underline transition-all">Acessibilidade</a></li>
              <li><a href="#" className="hover:underline transition-all">Mapa do Site</a></li>
              <li><a href="#" className="hover:underline transition-all">Termo de Uso</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-[#002244] py-4 px-4 sm:px-8 text-[12px] text-gray-300">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span>Todo o conteúdo deste site está publicado sob a licença Creative Commons</span>
          <span className="font-bold">www.gov.br</span>
        </div>
      </div>
    </footer>
  );
};

export default GovBrFooter;
