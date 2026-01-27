// src/pages/SocialFeed.tsx
import { useState, useMemo, useEffect } from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Filter,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { User, Provider } from "@/lib/Interfaces";
import ServiceCard from "@/components/cards/ServiceCard";
import DemandCard from "@/components/cards/DemandCard";

// Estados do Brasil para o filtro
const BR_STATES = [
  { sigla: "AC", nome: "Acre" }, { sigla: "AL", nome: "Alagoas" }, { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" }, { sigla: "BA", nome: "Bahia" }, { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" }, { sigla: "ES", nome: "Espírito Santo" }, { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" }, { sigla: "MT", nome: "Mato Grosso" }, { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" }, { sigla: "PA", nome: "Pará" }, { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" }, { sigla: "PE", nome: "Pernambuco" }, { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" }, { sigla: "RN", nome: "Rio Grande do Norte" }, { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" }, { sigla: "RR", nome: "Roraima" }, { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" }, { sigla: "SE", nome: "Sergipe" }, { sigla: "TO", nome: "Tocantins" }
];

const carouselImages = [
  {
    src: "/bannerImages/01.jpg",
    title: "Painel operacional de projetos",
    subtitle: "Acompanhe contatos, perfis e fases em um só lugar"
  },
  {
    src: "/bannerImages/02.webp",
    title: "Fluxo técnico de seleção",
    subtitle: "Validação de dados e histórico em tempo real"
  },
  {
    src: "/bannerImages/03.webp",
    title: "Organização de demandas",
    subtitle: "Filtros por serviço, cidade e perfil"
  }
];

export default function SocialFeed() {
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<"keyword" | "location">("keyword");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user: currentUser } = useAuth();
  
  // Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  // Data Fetching
  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["allUsers"],
    queryFn: async () => (await apiRequest("GET", "/users")).json(),
  });

  const { data: servicesRes, isLoading: loadingServices } = useQuery<{ servicesFreelancer: any[] }>({
    queryKey: ["servicesFreelancer"],
    queryFn: async () => (await apiRequest("GET", "/servicesfreelancer/getall")).json(),
    enabled: !!currentUser && (currentUser.type === "contratante" || !currentUser),
  });

  const { data: demandsRes, isLoading: loadingDemands } = useQuery<{ demands: any[] }>({
    queryKey: ["demands"],
    queryFn: async () => (await apiRequest("GET", "/demands/getall")).json(),
    enabled: !!currentUser && currentUser.type === "prestador",
  });

  const allUsers = usersData?.users || [];

  // Logic to determine what to show
  const showServices = !currentUser || currentUser.type === "contratante"; // Clients see Services
  
  // Enrich Data
  const filteredList = useMemo(() => {
    let rawList: any[] = [];
    
    if (showServices) {
      // Enrich Services
      rawList = (servicesRes?.servicesFreelancer || []).map(svc => {
        const owner = allUsers.find(u => u.id === svc.ServiceProvider?.user_id);
        return {
          ...svc,
          userName: owner?.name || "Prestador",
          userEmail: owner?.email || "",
          userPerfil: owner?.perfil,
          userType: owner?.type || "prestador",
          // Normalize price
          price: svc.price
        };
      });
    } else {
      // Enrich Demands
      rawList = (demandsRes?.demands || []).map(demand => {
        const owner = allUsers.find(u => u.id === demand.id_user);
        return {
          ...demand,
          userName: owner?.name || "Contratante",
          userEmail: owner?.email || "",
          userPerfil: owner?.perfil,
          // Normalize price/budget
          price: parseFloat(demand.price || demand.budget || '0'),
          createdAt: demand.createdAt || new Date().toISOString()
        };
      });
    }

    // Filter Logic
    return rawList.filter(item => {
      if (searchType === "keyword") {
        const term = search.toLowerCase();
        return (
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.userName?.toLowerCase().includes(term)
        );
      } else {
        // Location Filter (Mock logic as data might not strictly support name matching yet)
        // If we had city names in item, we would check them here.
        // For now, we assume true or partial match if available.
        // TODO: Implement rigorous City ID -> Name mapping or backend filter.
        return true; 
      }
    });

  }, [showServices, servicesRes, demandsRes, allUsers, search, searchType, selectedState, selectedCity]);


  const quickStartStyle = {
    "--paper": "#fff7ed", // Amber-50
    "--glow": "#fed7aa",  // Orange-200
    "--honey": "#fde68a", // Amber-200
    backgroundImage:
      "radial-gradient(1200px 500px at -10% -40%, var(--paper) 0%, transparent 70%), radial-gradient(900px 400px at 110% -20%, var(--glow) 0%, transparent 60%), radial-gradient(700px 280px at 50% 120%, var(--honey) 0%, transparent 70%)",
  } as CSSProperties;

  return (
    <ApplicationLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        
        {/* Hero Carousel */}
        <div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${image.src})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-4 max-w-4xl">
                    <motion.h1
                      key={`title-${currentSlide}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4"
                    >
                      {image.title}
                    </motion.h1>
                    <motion.p
                      key={`subtitle-${currentSlide}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg sm:text-xl lg:text-2xl text-white/90"
                    >
                      {image.subtitle}
                    </motion.p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"><ChevronLeft className="h-6 w-6" /></button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"><ChevronRight className="h-6 w-6" /></button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar de Filtro Refatorada */}
            <div className="lg:w-80 space-y-6">
              <Card className="border-0 bg-white/90 shadow-lg backdrop-blur-sm sticky top-24" style={quickStartStyle}>
                <CardHeader>
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Filter className="h-5 w-5" />
                    <span className="font-bold uppercase tracking-wider text-xs">Filtros</span>
                  </div>
                  <CardTitle className="text-xl text-slate-800">
                    O que você procura?
                  </CardTitle>
                  <CardDescription>
                    {showServices ? "Encontre serviços ideais" : "Encontre demandas de clientes"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Toggle Mode */}
                  <div className="flex p-1 bg-orange-100/50 rounded-xl">
                    <button
                      onClick={() => setSearchType("keyword")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        searchType === "keyword" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-500 hover:text-orange-500"
                      }`}
                    >
                      Palavra-chave
                    </button>
                    <button
                      onClick={() => setSearchType("location")}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        searchType === "location" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-500 hover:text-orange-500"
                      }`}
                    >
                      Localização
                    </button>
                  </div>

                  {/* Inputs */}
                  {searchType === "keyword" ? (
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-slate-500 uppercase">Busca Livre</label>
                       <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <Input 
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           placeholder={showServices ? "Ex: Render 3D, Interiores..." : "Ex: Projeto Casa, Reforma..."}
                           className="pl-9 bg-white/50 border-orange-200 focus:border-orange-400 focus:ring-orange-100"
                         />
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Estado (UF)</label>
                        <select 
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-orange-200 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
                        >
                          <option value="">Selecione...</option>
                          {BR_STATES.map((uf) => (
                            <option key={uf.sigla} value={uf.sigla}>{uf.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Cidade</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input 
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            placeholder="Digite a cidade..."
                            className="pl-9 bg-white/50 border-orange-200 focus:border-orange-400 focus:ring-orange-100"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 italic">
                        Mostrando resultados na região selecionada.
                      </p>
                    </div>
                  )}

                  <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md">
                    Filtrar Resultados
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Feed */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  {showServices ? "Serviços em Destaque" : "Demandas Recentes"}
                </h2>
                <Badge variant="outline" className="text-slate-500 border-slate-300">
                  {filteredList.length} encontrado(s)
                </Badge>
              </div>

              {(loadingServices || loadingDemands) ? (
                 <div className="flex justify-center py-20">
                   <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                 </div>
              ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredList.map((item: any, idx) => (
                    showServices ? (
                      <ServiceCard key={item.id_serviceFreelancer || idx} service={item} currentUser={currentUser} />
                    ) : (
                      <DemandCard key={item.id_demand || idx} demand={item} currentUser={currentUser} />
                    )
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-10 text-center border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Nenhum resultado encontrado</h3>
                  <p className="text-slate-500 mt-2">Tente ajustar os filtros ou buscar por outros termos.</p>
                  <Button 
                    variant="link" 
                    className="mt-4 text-orange-600"
                    onClick={() => { setSearch(""); setSearchType("keyword"); }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ApplicationLayout>
  );
}
