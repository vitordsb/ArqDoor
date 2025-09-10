
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const CombinedHomeSections = () => {
  const [text, setText] = useState<string>("Comece a usar agora");

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      setText("Continuar usando, você está online!");
    }
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        className="flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.9)), url('https://www.weg.net/weghome/wp-content/uploads/2017/12/arquitetura-e-urbanismo.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "85vh",
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-orange-500">Sua Casa dos Sonhos</span> com Segurança e Velocidade
          </h1>

          {/* Texto de apoio conforme a imagem */}
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Encontre os melhores arquitetos e engenheiros para realizar os seus sonhos com o máximo de segurança
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/home">
              <Button className="bg-orange-500 text-white px-8 py-6 rounded-full text-lg font-semibold hover:bg-orange-600 transition-all">
                {text}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HowItWorks Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Como funciona o ArqDoor
          </h2>

          <div className="space-y-12">
            {/* Etapa 1 */}
            <div className="flex items-start gap-6">
              <div className="bg-orange-500 rounded-lg p-6 flex-shrink-0">
                {/* Ícone de aperto de mãos mais simples */}
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11,2A2,2 0 0,1 13,4V8H21A1,1 0 0,1 22,9V11A4,4 0 0,1 18,15H16L15,16V20A2,2 0 0,1 13,22H4A2,2 0 0,1 2,20V15A2,2 0 0,1 4,13H8V9A2,2 0 0,1 10,7H11V4A2,2 0 0,1 11,2M13,10V15H18A2,2 0 0,0 20,13V10H13M8,15V20H13V17L14,16H16V15H4V20H6V15H8Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold">Entre em contato com o Profissional</h3>
                </div>
                <p className="text-gray-600">
                  Escolha um dos arquitetos e engenheiros parceiros da ArqDoor e utilize o nosso <strong>Chat integrado</strong> para planejar os seus sonhos. Cada um dos nossos parceiros são verificados por nossa equipe para garantir os melhores profissionais para você!
                </p>
              </div>
            </div>

            {/* Etapa 2 */}
            <div className="flex items-start gap-6">
              <div className="bg-orange-500 rounded-lg p-6 flex-shrink-0">
                {/* Ícone de documento/clipboard mais simples */}
                <svg className="w-6 h0-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V9H7V7M7,11H17V13H7V11M7,15H13V17H7V15Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold">Analise, Aprove e Acompanhe as fases do Projeto com Contratos Digitais</h3>
                </div>
                <p className="text-gray-600">
                  Utilize o nosso sistema de Contratos digitais, disponíveis no próprio Chat, para acompanhar as fases do seu Projeto. Aqui o cliente mantém o controle sobre a entrega de cada fase com o mecanismo de confirmação!
                </p>
              </div>
            </div>

            {/* Etapa 3 */}
            <div className="flex items-start gap-6">
              <div className="bg-orange-500 rounded-lg p-6 flex-shrink-0">
                {/* Ícone de escudo/segurança mais simples */}
                <svg className="w-6 h0-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold">Mantenha seu dinheiro seguro, e caso se arrependa, receba de volta em até 48 horas</h3>
                </div>
                <p className="text-gray-600">
                  Na ArqDoor o seu dinheiro fica <strong>seguro</strong> durante cada etapa da obra! Utilize o nosso sistema de <strong>Depósito em Garantia</strong>, liberando o valor da etapa somente após o mecanismo de confirmação da plataforma. Caso não queira continuar a obra com o profissional, receba o dinheiro das fases ainda não finalizadas em até 48 horas!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Por que usar o ArqDoor?</h2>

              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center mb-2">
                  <svg className="w-6 h-6 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Rede de profissionais verificados
                </h3>
                <p className="text-gray-600">Encontre arquitetos e projetistas com portfólios validados, prontos para atender projetos residenciais, comerciais e corporativos.</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center mb-2">
                  <svg className="w-6 h-6 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Orçamentos claros e sem surpresas
                </h3>
                <p className="text-gray-600">Compare valores e escopos de forma transparente. Escolha o profissional que se encaixa no seu orçamento com confiança.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold flex items-center mb-2">
                  <svg className="w-6 h-6 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Gestão de projeto integrada
                </h3>
                <p className="text-gray-600">Troque mensagens, envie arquivos e acompanhe entregas com ferramentas integradas para facilitar sua obra do início ao fim.</p>
              </div>
            </div>

            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80"
                alt="Colaboração em projeto de interiores"
                className="rounded-lg shadow-xl"
                width="600"
                height="400"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CombinedHomeSections;


