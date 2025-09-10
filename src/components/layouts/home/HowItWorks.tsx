
const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Como funciona o ArqDoor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Etapa 1 */}
          <div className="text-left">
            <div className="flex items-start mb-6">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg flex-grow">
                {/* Ícone de aperto de mãos */}
                <svg className="w-12 h-12 text-orange-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.5 12c0-.28-.11-.53-.29-.71l-1.5-1.5c-.18-.18-.43-.29-.71-.29s-.53.11-.71.29l-.59.59-.59-.59c-.18-.18-.43-.29-.71-.29s-.53.11-.71.29l-1.5 1.5c-.18.18-.29.43-.29.71s.11.53.29.71l.59.59-.59.59c-.18.18-.29.43-.29.71s.11.53.29.71l1.5 1.5c.18.18.43.29.71.29s.53-.11.71-.29l.59-.59.59.59c.18.18.43.29.71.29s.53-.11.71-.29l1.5-1.5c.18-.18.29-.43.29-.71s-.11-.53-.29-.71l-.59-.59.59-.59c.18-.18.29-.43.29-.71z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4">Entre em contato com o Profissional</h3>
            <p className="text-gray-600">
              Escolha um dos arquitetos e engenheiros parceiros da ArqDoor e utilize o nosso <strong>Chat integrado</strong> para planejar os seus sonhos. Cada um dos nossos parceiros são verificados por nossa equipe para garantir os melhores profissionais para você!
            </p>
          </div>

          {/* Etapa 2 */}
          <div className="text-left">
            <div className="flex items-start mb-6">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg flex-grow">
                {/* Ícone de documento/contrato */}
                <svg className="w-12 h-12 text-orange-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  <path d="M8,12V14H16V12H8M8,16V18H13V16H8Z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4">Analise, Aprove e Acompanhe as fases do Projeto com Contratos Digitais</h3>
            <p className="text-gray-600">
              Utilize o nosso sistema de Contratos digitais, disponíveis no próprio Chat, para acompanhar as fases do seu Projeto. Aqui o cliente mantém o controle sobre a entrega de cada fase com o mecanismo de confirmação!
            </p>
          </div>

          {/* Etapa 3 */}
          <div className="text-left">
            <div className="flex items-start mb-6">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg flex-grow">
                {/* Ícone de cadeado/segurança */}
                <svg className="w-12 h-12 text-orange-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-4">Mantenha seu dinheiro seguro, e caso se arrependa, receba de volta em até 48 horas</h3>
            <p className="text-gray-600">
              Na ArqDoor o seu dinheiro fica <strong>seguro</strong> durante cada etapa da obra! Utilize o nosso sistema de <strong>Depósito em Garantia</strong>, liberando o valor da etapa somente após o mecanismo de confirmação da plataforma. Caso não queira continuar a obra com o profissional, receba o dinheiro das fases ainda não finalizadas em até 48 horas!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


