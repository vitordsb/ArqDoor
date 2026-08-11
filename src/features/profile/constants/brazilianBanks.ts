// Fonte: Banco Central do Brasil Open Data (STR Participants List)
// Recurso oficial consultado em 2026-04-02: https://www.bcb.gov.br/pom/spb/ing/ParticipantesSTRIng.csv

export type BrazilianBank = {
  code: string;
  name: string;
  shortName: string;
  ispb: string;
};

export const BRAZILIAN_BANKS: BrazilianBank[] = [
  {
    "code": "001",
    "name": "Banco do Brasil S.A.",
    "shortName": "BCO DO BRASIL S.A.",
    "ispb": "00000000"
  },
  {
    "code": "003",
    "name": "BANCO DA AMAZONIA S.A.",
    "shortName": "BCO DA AMAZONIA S.A.",
    "ispb": "04902979"
  },
  {
    "code": "004",
    "name": "Banco do Nordeste do Brasil S.A.",
    "shortName": "BCO DO NORDESTE DO BRASIL S.A.",
    "ispb": "07237373"
  },
  {
    "code": "007",
    "name": "BANCO NACIONAL DE DESENVOLVIMENTO ECONOMICO E SOCIAL",
    "shortName": "BNDES",
    "ispb": "33657248"
  },
  {
    "code": "010",
    "name": "CREDICOAMO CREDITO RURAL COOPERATIVA",
    "shortName": "CREDICOAMO",
    "ispb": "81723108"
  },
  {
    "code": "011",
    "name": "CREDIT SUISSE HEDGING-GRIFFO CORRETORA DE VALORES S.A",
    "shortName": "C.SUISSE HEDGING-GRIFFO CV S/A",
    "ispb": "61809182"
  },
  {
    "code": "012",
    "name": "Banco Inbursa S.A.",
    "shortName": "BANCO INBURSA",
    "ispb": "04866275"
  },
  {
    "code": "014",
    "name": "STATE STREET BRASIL S.A. - BANCO COMERCIAL",
    "shortName": "STATE STREET BR S.A. BCO COMERCIAL",
    "ispb": "09274232"
  },
  {
    "code": "015",
    "name": "UBS Brasil Corretora de Câmbio, Títulos e Valores Mobiliários S.A.",
    "shortName": "UBS BRASIL CCTVM S.A.",
    "ispb": "02819125"
  },
  {
    "code": "016",
    "name": "COOPERATIVA DE CRÉDITO MÚTUO DOS DESPACHANTES DE TRÂNSITO DE SANTA CATARINA E RI",
    "shortName": "CCM DESP TRÂNS SC E RS",
    "ispb": "04715685"
  },
  {
    "code": "017",
    "name": "BNY Mellon Banco S.A.",
    "shortName": "BNY MELLON BCO S.A.",
    "ispb": "42272526"
  },
  {
    "code": "018",
    "name": "Banco Tricury S.A.",
    "shortName": "BCO TRICURY S.A.",
    "ispb": "57839805"
  },
  {
    "code": "021",
    "name": "BANESTES S.A. BANCO DO ESTADO DO ESPIRITO SANTO",
    "shortName": "BCO BANESTES S.A.",
    "ispb": "28127603"
  },
  {
    "code": "024",
    "name": "Banco Bandepe S.A.",
    "shortName": "BCO BANDEPE S.A.",
    "ispb": "10866788"
  },
  {
    "code": "025",
    "name": "Banco Alfa S.A.",
    "shortName": "BCO ALFA S.A.",
    "ispb": "03323840"
  },
  {
    "code": "029",
    "name": "Banco Itaú Consignado S.A.",
    "shortName": "BANCO ITAÚ CONSIGNADO S.A.",
    "ispb": "33885724"
  },
  {
    "code": "033",
    "name": "BANCO SANTANDER (BRASIL) S.A.",
    "shortName": "BCO SANTANDER (BRASIL) S.A.",
    "ispb": "90400888"
  },
  {
    "code": "036",
    "name": "Banco Bradesco BBI S.A.",
    "shortName": "BCO BBI S.A.",
    "ispb": "06271464"
  },
  {
    "code": "037",
    "name": "Banco do Estado do Pará S.A.",
    "shortName": "BCO DO EST. DO PA S.A.",
    "ispb": "04913711"
  },
  {
    "code": "040",
    "name": "Banco Cargill S.A.",
    "shortName": "BCO CARGILL S.A.",
    "ispb": "03609817"
  },
  {
    "code": "041",
    "name": "Banco do Estado do Rio Grande do Sul S.A.",
    "shortName": "BCO DO ESTADO DO RS S.A.",
    "ispb": "92702067"
  },
  {
    "code": "047",
    "name": "Banco do Estado de Sergipe S.A.",
    "shortName": "BCO DO EST. DE SE S.A.",
    "ispb": "13009717"
  },
  {
    "code": "060",
    "name": "Confidence Corretora de Câmbio S.A.",
    "shortName": "CONFIDENCE CC S.A.",
    "ispb": "04913129"
  },
  {
    "code": "062",
    "name": "Hipercard Banco Múltiplo S.A.",
    "shortName": "HIPERCARD BM S.A.",
    "ispb": "03012230"
  },
  {
    "code": "063",
    "name": "Banco Bradescard S.A.",
    "shortName": "BANCO BRADESCARD",
    "ispb": "04184779"
  },
  {
    "code": "064",
    "name": "GOLDMAN SACHS DO BRASIL BANCO MULTIPLO S.A.",
    "shortName": "GOLDMAN SACHS DO BRASIL BM S.A",
    "ispb": "04332281"
  },
  {
    "code": "065",
    "name": "Banco AndBank (Brasil) S.A.",
    "shortName": "BCO ANDBANK S.A.",
    "ispb": "48795256"
  },
  {
    "code": "066",
    "name": "BANCO MORGAN STANLEY S.A.",
    "shortName": "BCO MORGAN STANLEY S.A.",
    "ispb": "02801938"
  },
  {
    "code": "069",
    "name": "Banco Crefisa S.A.",
    "shortName": "BCO CREFISA S.A.",
    "ispb": "61033106"
  },
  {
    "code": "070",
    "name": "BRB - BANCO DE BRASILIA S.A.",
    "shortName": "BRB - BCO DE BRASILIA S.A.",
    "ispb": "00000208"
  },
  {
    "code": "074",
    "name": "Banco J. Safra S.A.",
    "shortName": "BCO. J.SAFRA S.A.",
    "ispb": "03017677"
  },
  {
    "code": "075",
    "name": "Banco ABN Amro S.A.",
    "shortName": "BCO ABN AMRO S.A.",
    "ispb": "03532415"
  },
  {
    "code": "076",
    "name": "Banco KDB do Brasil S.A.",
    "shortName": "BCO KDB BRASIL S.A.",
    "ispb": "07656500"
  },
  {
    "code": "077",
    "name": "Banco Inter S.A.",
    "shortName": "BANCO INTER",
    "ispb": "00416968"
  },
  {
    "code": "078",
    "name": "Haitong Banco de Investimento do Brasil S.A.",
    "shortName": "HAITONG BI DO BRASIL S.A.",
    "ispb": "34111187"
  },
  {
    "code": "079",
    "name": "PICPAY BANK - BANCO MÚLTIPLO S.A",
    "shortName": "PICPAY BANK - BANCO MÚLTIPLO S.A",
    "ispb": "09516419"
  },
  {
    "code": "080",
    "name": "B&T CORRETORA DE CAMBIO LTDA.",
    "shortName": "B&T CC LTDA.",
    "ispb": "73622748"
  },
  {
    "code": "081",
    "name": "BancoSeguro S.A.",
    "shortName": "BANCOSEGURO S.A.",
    "ispb": "10264663"
  },
  {
    "code": "082",
    "name": "BANCO TOPÁZIO S.A.",
    "shortName": "BANCO TOPÁZIO S.A.",
    "ispb": "07679404"
  },
  {
    "code": "083",
    "name": "Banco da China Brasil S.A.",
    "shortName": "BCO DA CHINA BRASIL S.A.",
    "ispb": "10690848"
  },
  {
    "code": "084",
    "name": "SISPRIME DO BRASIL - COOPERATIVA DE CRÉDITO",
    "shortName": "SISPRIME DO BRASIL - COOP",
    "ispb": "02398976"
  },
  {
    "code": "085",
    "name": "Cooperativa Central de Crédito - Ailos",
    "shortName": "COOPCENTRAL AILOS",
    "ispb": "05463212"
  },
  {
    "code": "088",
    "name": "BANCO RANDON S.A.",
    "shortName": "BANCO RANDON S.A.",
    "ispb": "11476673"
  },
  {
    "code": "089",
    "name": "CREDISAN COOPERATIVA DE CRÉDITO",
    "shortName": "CREDISAN CC",
    "ispb": "62109566"
  },
  {
    "code": "093",
    "name": "PÓLOCRED SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORT",
    "shortName": "POLOCRED SCMEPP LTDA.",
    "ispb": "07945233"
  },
  {
    "code": "094",
    "name": "Banco Finaxis S.A.",
    "shortName": "BANCO FINAXIS",
    "ispb": "11758741"
  },
  {
    "code": "095",
    "name": "Travelex Banco de Câmbio S.A.",
    "shortName": "TRAVELEX BANCO DE CÂMBIO S.A.",
    "ispb": "11703662"
  },
  {
    "code": "096",
    "name": "Banco B3 S.A.",
    "shortName": "BCO B3 S.A.",
    "ispb": "00997185"
  },
  {
    "code": "097",
    "name": "Credisis - Central de Cooperativas de Crédito Ltda.",
    "shortName": "CREDISIS CENTRAL DE COOPERATIVAS DE CRÉDITO LTDA.",
    "ispb": "04632856"
  },
  {
    "code": "098",
    "name": "Credialiança Cooperativa de Crédito Rural",
    "shortName": "CREDIALIANÇA CCR",
    "ispb": "78157146"
  },
  {
    "code": "099",
    "name": "UNIPRIME CENTRAL NACIONAL - CENTRAL NACIONAL DE COOPERATIVA DE CREDITO",
    "shortName": "UNIPRIME COOPCENTRAL LTDA.",
    "ispb": "03046391"
  },
  {
    "code": "100",
    "name": "Planner Corretora de Valores S.A.",
    "shortName": "PLANNER CV S.A.",
    "ispb": "00806535"
  },
  {
    "code": "101",
    "name": "RENASCENCA DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA",
    "shortName": "RENASCENCA DTVM LTDA",
    "ispb": "62287735"
  },
  {
    "code": "102",
    "name": "XP INVESTIMENTOS CORRETORA DE CÂMBIO,TÍTULOS E VALORES MOBILIÁRIOS S/A",
    "shortName": "XP INVESTIMENTOS CCTVM S/A",
    "ispb": "02332886"
  },
  {
    "code": "104",
    "name": "CAIXA ECONOMICA FEDERAL",
    "shortName": "CAIXA ECONOMICA FEDERAL",
    "ispb": "00360305"
  },
  {
    "code": "105",
    "name": "Lecca Crédito, Financiamento e Investimento S/A",
    "shortName": "LECCA CFI S.A.",
    "ispb": "07652226"
  },
  {
    "code": "107",
    "name": "Banco Bocom BBM S.A.",
    "shortName": "BCO BOCOM BBM S.A.",
    "ispb": "15114366"
  },
  {
    "code": "111",
    "name": "OLIVEIRA TRUST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIARIOS S.A.",
    "shortName": "OLIVEIRA TRUST DTVM S.A.",
    "ispb": "36113876"
  },
  {
    "code": "113",
    "name": "NEON CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "NEON CTVM S.A.",
    "ispb": "61723847"
  },
  {
    "code": "114",
    "name": "Central Cooperativa de Crédito no Estado do Espírito Santo - CECOOP",
    "shortName": "CENTRAL COOPERATIVA DE CRÉDITO NO ESTADO DO ESPÍRITO SANTO",
    "ispb": "05790149"
  },
  {
    "code": "117",
    "name": "ADVANCED CORRETORA DE CÂMBIO LTDA",
    "shortName": "ADVANCED CC LTDA",
    "ispb": "92856905"
  },
  {
    "code": "119",
    "name": "Banco Western Union do Brasil S.A.",
    "shortName": "BCO WESTERN UNION",
    "ispb": "13720915"
  },
  {
    "code": "120",
    "name": "BANCO RODOBENS S.A.",
    "shortName": "BCO RODOBENS S.A.",
    "ispb": "33603457"
  },
  {
    "code": "121",
    "name": "Banco Agibank S.A.",
    "shortName": "BCO AGIBANK S.A.",
    "ispb": "10664513"
  },
  {
    "code": "122",
    "name": "Banco Bradesco BERJ S.A.",
    "shortName": "BCO BRADESCO BERJ S.A.",
    "ispb": "33147315"
  },
  {
    "code": "124",
    "name": "Banco Woori Bank do Brasil S.A.",
    "shortName": "BCO WOORI BANK DO BRASIL S.A.",
    "ispb": "15357060"
  },
  {
    "code": "125",
    "name": "BANCO GENIAL S.A.",
    "shortName": "BANCO GENIAL",
    "ispb": "45246410"
  },
  {
    "code": "126",
    "name": "BR Partners Banco de Investimento S.A.",
    "shortName": "BR PARTNERS BI",
    "ispb": "13220493"
  },
  {
    "code": "127",
    "name": "Codepe Corretora de Valores e Câmbio S.A.",
    "shortName": "CODEPE CVC S.A.",
    "ispb": "09512542"
  },
  {
    "code": "128",
    "name": "BRAZA BANK S.A. BANCO DE CÂMBIO",
    "shortName": "BRAZA BANK S.A. BCO DE CÂMBIO",
    "ispb": "19307785"
  },
  {
    "code": "129",
    "name": "UBS Brasil Banco de Investimento S.A.",
    "shortName": "UBS BRASIL BI S.A.",
    "ispb": "18520834"
  },
  {
    "code": "130",
    "name": "CARUANA S.A. - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "CARUANA SCFI",
    "ispb": "09313766"
  },
  {
    "code": "131",
    "name": "TULLETT PREBON BRASIL CORRETORA DE VALORES E CÂMBIO LTDA",
    "shortName": "TULLETT PREBON BRASIL CVC LTDA",
    "ispb": "61747085"
  },
  {
    "code": "132",
    "name": "ICBC do Brasil Banco Múltiplo S.A.",
    "shortName": "ICBC DO BRASIL BM S.A.",
    "ispb": "17453575"
  },
  {
    "code": "133",
    "name": "CONFEDERAÇÃO NACIONAL DAS COOPERATIVAS CENTRAIS DE CRÉDITO E ECONOMIA FAMILIAR E",
    "shortName": "CRESOL CONFEDERAÇÃO",
    "ispb": "10398952"
  },
  {
    "code": "134",
    "name": "BGC LIQUIDEZ DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA",
    "shortName": "BGC LIQUIDEZ DTVM LTDA",
    "ispb": "33862244"
  },
  {
    "code": "136",
    "name": "CONFEDERAÇÃO NACIONAL DAS COOPERATIVAS CENTRAIS UNICRED LTDA. - UNICRED DO BRASI",
    "shortName": "CONF NAC COOP CENTRAIS UNICRED",
    "ispb": "00315557"
  },
  {
    "code": "138",
    "name": "Get Money Corretora de Câmbio S.A.",
    "shortName": "GET MONEY CC LTDA",
    "ispb": "10853017"
  },
  {
    "code": "139",
    "name": "Intesa Sanpaolo Brasil S.A. - Banco Múltiplo",
    "shortName": "INTESA SANPAOLO BRASIL S.A. BM",
    "ispb": "55230916"
  },
  {
    "code": "140",
    "name": "NU INVEST CORRETORA DE VALORES S.A.",
    "shortName": "NU INVEST CORRETORA DE VALORES S.A.",
    "ispb": "62169875"
  },
  {
    "code": "141",
    "name": "BANCO MASTER DE INVESTIMENTO S.A.",
    "shortName": "MASTER BI S.A.",
    "ispb": "09526594"
  },
  {
    "code": "142",
    "name": "Broker Brasil Corretora de Câmbio Ltda.",
    "shortName": "BROKER BRASIL CC LTDA.",
    "ispb": "16944141"
  },
  {
    "code": "143",
    "name": "Treviso Corretora de Câmbio S.A.",
    "shortName": "TREVISO CC S.A.",
    "ispb": "02992317"
  },
  {
    "code": "144",
    "name": "BEXS BANCO DE CÂMBIO S/A",
    "shortName": "BEXS BCO DE CAMBIO S.A.",
    "ispb": "13059145"
  },
  {
    "code": "145",
    "name": "LEVYCAM - CORRETORA DE CAMBIO E VALORES LTDA.",
    "shortName": "LEVYCAM CCV LTDA",
    "ispb": "50579044"
  },
  {
    "code": "146",
    "name": "GUITTA CORRETORA DE CAMBIO LTDA.",
    "shortName": "GUITTA CC LTDA",
    "ispb": "24074692"
  },
  {
    "code": "149",
    "name": "Facta Financeira S.A. - Crédito Financiamento e Investimento",
    "shortName": "FACTA S.A. CFI",
    "ispb": "15581638"
  },
  {
    "code": "157",
    "name": "ICAP do Brasil Corretora de Títulos e Valores Mobiliários Ltda.",
    "shortName": "ICAP DO BRASIL CTVM LTDA.",
    "ispb": "09105360"
  },
  {
    "code": "159",
    "name": "Casa do Crédito S.A. Sociedade de Crédito ao Microempreendedor",
    "shortName": "CASA CREDITO S.A. SCM",
    "ispb": "05442029"
  },
  {
    "code": "173",
    "name": "BRL Trust Distribuidora de Títulos e Valores Mobiliários S.A.",
    "shortName": "BRL TRUST DTVM SA",
    "ispb": "13486793"
  },
  {
    "code": "174",
    "name": "PEFISA S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "PEFISA S.A. - C.F.I.",
    "ispb": "43180355"
  },
  {
    "code": "177",
    "name": "Guide Investimentos S.A. Corretora de Valores",
    "shortName": "GUIDE",
    "ispb": "65913436"
  },
  {
    "code": "180",
    "name": "CM CAPITAL MARKETS CORRETORA DE CÂMBIO, TÍTULOS E VALORES MOBILIÁRIOS LTDA",
    "shortName": "CM CAPITAL MARKETS CCTVM LTDA",
    "ispb": "02685483"
  },
  {
    "code": "183",
    "name": "SOCRED S.A. - SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO P",
    "shortName": "SOCRED SA - SCMEPP",
    "ispb": "09210106"
  },
  {
    "code": "184",
    "name": "Banco Itaú BBA S.A.",
    "shortName": "BCO ITAÚ BBA S.A.",
    "ispb": "17298092"
  },
  {
    "code": "188",
    "name": "ATIVA INVESTIMENTOS S.A. CORRETORA DE TÍTULOS, CÂMBIO E VALORES",
    "shortName": "ATIVA S.A. INVESTIMENTOS CCTVM",
    "ispb": "33775974"
  },
  {
    "code": "189",
    "name": "HS FINANCEIRA S/A CREDITO, FINANCIAMENTO E INVESTIMENTOS",
    "shortName": "HS FINANCEIRA",
    "ispb": "07512441"
  },
  {
    "code": "190",
    "name": "SERVICOOP - COOPERATIVA DE CRÉDITO DOS SERVIDORES PÚBLICOS ESTADUAIS E MUNICIPAI",
    "shortName": "SERVICOOP",
    "ispb": "03973814"
  },
  {
    "code": "191",
    "name": "Nova Futura Corretora de Títulos e Valores Mobiliários Ltda.",
    "shortName": "NOVA FUTURA CTVM LTDA.",
    "ispb": "04257795"
  },
  {
    "code": "194",
    "name": "PARMETAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA",
    "shortName": "PARMETAL DTVM LTDA",
    "ispb": "20155248"
  },
  {
    "code": "195",
    "name": "VALOR SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "VALOR SCD S.A.",
    "ispb": "07799277"
  },
  {
    "code": "196",
    "name": "FAIR CORRETORA DE CAMBIO S.A.",
    "shortName": "FAIR CC S.A.",
    "ispb": "32648370"
  },
  {
    "code": "197",
    "name": "STONE INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "STONE IP S.A.",
    "ispb": "16501555"
  },
  {
    "code": "208",
    "name": "Banco BTG Pactual S.A.",
    "shortName": "BANCO BTG PACTUAL S.A.",
    "ispb": "30306294"
  },
  {
    "code": "212",
    "name": "Banco Original S.A.",
    "shortName": "BANCO ORIGINAL",
    "ispb": "92894922"
  },
  {
    "code": "213",
    "name": "Banco Arbi S.A.",
    "shortName": "BCO ARBI S.A.",
    "ispb": "54403563"
  },
  {
    "code": "217",
    "name": "Banco John Deere S.A.",
    "shortName": "BANCO JOHN DEERE S.A.",
    "ispb": "91884981"
  },
  {
    "code": "218",
    "name": "Banco BS2 S.A.",
    "shortName": "BCO BS2 S.A.",
    "ispb": "71027866"
  },
  {
    "code": "222",
    "name": "BANCO CRÉDIT AGRICOLE BRASIL S.A.",
    "shortName": "BCO CRÉDIT AGRICOLE BR S.A.",
    "ispb": "75647891"
  },
  {
    "code": "224",
    "name": "Banco Fibra S.A.",
    "shortName": "BCO FIBRA S.A.",
    "ispb": "58616418"
  },
  {
    "code": "233",
    "name": "Banco Cifra S.A.",
    "shortName": "BANCO CIFRA",
    "ispb": "62421979"
  },
  {
    "code": "237",
    "name": "Banco Bradesco S.A.",
    "shortName": "BCO BRADESCO S.A.",
    "ispb": "60746948"
  },
  {
    "code": "241",
    "name": "BANCO CLASSICO S.A.",
    "shortName": "BCO CLASSICO S.A.",
    "ispb": "31597552"
  },
  {
    "code": "243",
    "name": "BANCO MASTER S/A",
    "shortName": "BANCO MASTER",
    "ispb": "33923798"
  },
  {
    "code": "246",
    "name": "Banco ABC Brasil S.A.",
    "shortName": "BCO ABC BRASIL S.A.",
    "ispb": "28195667"
  },
  {
    "code": "249",
    "name": "Banco Investcred Unibanco S.A.",
    "shortName": "BANCO INVESTCRED UNIBANCO S.A.",
    "ispb": "61182408"
  },
  {
    "code": "250",
    "name": "BCV - BANCO DE CRÉDITO E VAREJO S.A.",
    "shortName": "BCV - BCO, CRÉDITO E VAREJO S.A.",
    "ispb": "50585090"
  },
  {
    "code": "253",
    "name": "Bexs Corretora de Câmbio S/A",
    "shortName": "BEXS CC S.A.",
    "ispb": "52937216"
  },
  {
    "code": "254",
    "name": "PARANÁ BANCO S.A.",
    "shortName": "PARANA BCO S.A.",
    "ispb": "14388334"
  },
  {
    "code": "259",
    "name": "MONEYCORP BANCO DE CÂMBIO S.A.",
    "shortName": "MONEYCORP BCO DE CÂMBIO S.A.",
    "ispb": "08609934"
  },
  {
    "code": "260",
    "name": "NU PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENTO",
    "shortName": "NU PAGAMENTOS - IP",
    "ispb": "18236120"
  },
  {
    "code": "265",
    "name": "Banco Fator S.A.",
    "shortName": "BCO FATOR S.A.",
    "ispb": "33644196"
  },
  {
    "code": "266",
    "name": "BANCO CEDULA S.A.",
    "shortName": "BCO CEDULA S.A.",
    "ispb": "33132044"
  },
  {
    "code": "268",
    "name": "BARI COMPANHIA HIPOTECÁRIA",
    "shortName": "BARI CIA HIPOTECÁRIA",
    "ispb": "14511781"
  },
  {
    "code": "269",
    "name": "BANCO HSBC S.A.",
    "shortName": "BCO HSBC S.A.",
    "ispb": "53518684"
  },
  {
    "code": "270",
    "name": "SAGITUR CORRETORA DE CÂMBIO S.A.",
    "shortName": "SAGITUR CC",
    "ispb": "61444949"
  },
  {
    "code": "271",
    "name": "IB Corretora de Câmbio, Títulos e Valores Mobiliários S.A.",
    "shortName": "IB CCTVM S.A.",
    "ispb": "27842177"
  },
  {
    "code": "272",
    "name": "AGK CORRETORA DE CAMBIO S.A.",
    "shortName": "AGK CC S.A.",
    "ispb": "00250699"
  },
  {
    "code": "273",
    "name": "Cooperativa de Crédito Rural de São Miguel do Oeste - Sulcredi/São Miguel",
    "shortName": "CCR DE SÃO MIGUEL DO OESTE",
    "ispb": "08253539"
  },
  {
    "code": "274",
    "name": "BMP SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E A EMPRESA DE PEQUENO PORTE LTDA.",
    "shortName": "BMP SCMEPP LTDA",
    "ispb": "11581339"
  },
  {
    "code": "276",
    "name": "BANCO SENFF S.A.",
    "shortName": "BCO SENFF S.A.",
    "ispb": "11970623"
  },
  {
    "code": "278",
    "name": "Genial Investimentos Corretora de Valores Mobiliários S.A.",
    "shortName": "GENIAL INVESTIMENTOS CVM S.A.",
    "ispb": "27652684"
  },
  {
    "code": "279",
    "name": "PRIMACREDI COOPERATIVA DE CRÉDITO DE PRIMAVERA DO LESTE",
    "shortName": "COOP DE PRIMAVERA DO LESTE",
    "ispb": "26563270"
  },
  {
    "code": "280",
    "name": "WILL FINANCEIRA S.A. CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "WILL FINANCEIRA S.A.CFI",
    "ispb": "23862762"
  },
  {
    "code": "281",
    "name": "Cooperativa de Crédito Rural Coopavel",
    "shortName": "CCR COOPAVEL",
    "ispb": "76461557"
  },
  {
    "code": "283",
    "name": "RB INVESTIMENTOS DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LIMITADA",
    "shortName": "RB INVESTIMENTOS DTVM LTDA.",
    "ispb": "89960090"
  },
  {
    "code": "285",
    "name": "FRENTE CORRETORA DE CÂMBIO S.A.",
    "shortName": "FRENTE CC S.A.",
    "ispb": "71677850"
  },
  {
    "code": "288",
    "name": "CAROL DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LTDA.",
    "shortName": "CAROL DTVM LTDA.",
    "ispb": "62237649"
  },
  {
    "code": "289",
    "name": "EFX CORRETORA DE CÂMBIO LTDA.",
    "shortName": "EFX CC LTDA.",
    "ispb": "94968518"
  },
  {
    "code": "290",
    "name": "PAGSEGURO INTERNET INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "PAGSEGURO INTERNET IP S.A.",
    "ispb": "08561701"
  },
  {
    "code": "292",
    "name": "BS2 Distribuidora de Títulos e Valores Mobiliários S.A.",
    "shortName": "BS2 DTVM S.A.",
    "ispb": "28650236"
  },
  {
    "code": "293",
    "name": "Lastro RDV Distribuidora de Títulos e Valores Mobiliários Ltda.",
    "shortName": "LASTRO RDV DTVM LTDA",
    "ispb": "71590442"
  },
  {
    "code": "296",
    "name": "OZ CORRETORA DE CÂMBIO S.A.",
    "shortName": "OZ CORRETORA DE CÂMBIO S.A.",
    "ispb": "04062902"
  },
  {
    "code": "298",
    "name": "Vip's Corretora de Câmbio Ltda.",
    "shortName": "VIPS CC LTDA.",
    "ispb": "17772370"
  },
  {
    "code": "299",
    "name": "BANCO AFINZ S.A. - BANCO MÚLTIPLO",
    "shortName": "BCO AFINZ S.A. - BM",
    "ispb": "04814563"
  },
  {
    "code": "300",
    "name": "Banco de la Nacion Argentina",
    "shortName": "BCO LA NACION ARGENTINA",
    "ispb": "33042151"
  },
  {
    "code": "301",
    "name": "DOCK INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "DOCK IP S.A.",
    "ispb": "13370835"
  },
  {
    "code": "306",
    "name": "PORTOPAR DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LTDA.",
    "shortName": "PORTOPAR DTVM LTDA",
    "ispb": "40303299"
  },
  {
    "code": "307",
    "name": "Terra Investimentos Distribuidora de Títulos e Valores Mobiliários Ltda.",
    "shortName": "TERRA INVESTIMENTOS DTVM",
    "ispb": "03751794"
  },
  {
    "code": "309",
    "name": "CAMBIONET CORRETORA DE CÂMBIO LTDA.",
    "shortName": "CAMBIONET CC LTDA",
    "ispb": "14190547"
  },
  {
    "code": "310",
    "name": "VORTX DISTRIBUIDORA DE TITULOS E VALORES MOBILIARIOS LTDA.",
    "shortName": "VORTX DTVM LTDA.",
    "ispb": "22610500"
  },
  {
    "code": "311",
    "name": "DOURADA CORRETORA DE CÂMBIO LTDA.",
    "shortName": "DOURADA CORRETORA",
    "ispb": "76641497"
  },
  {
    "code": "312",
    "name": "HSCM - SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LT",
    "shortName": "HSCM SCMEPP LTDA.",
    "ispb": "07693858"
  },
  {
    "code": "313",
    "name": "AMAZÔNIA CORRETORA DE CÂMBIO LTDA.",
    "shortName": "AMAZÔNIA CC LTDA.",
    "ispb": "16927221"
  },
  {
    "code": "318",
    "name": "Banco BMG S.A.",
    "shortName": "BCO BMG S.A.",
    "ispb": "61186680"
  },
  {
    "code": "319",
    "name": "OM DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA",
    "shortName": "OM DTVM LTDA",
    "ispb": "11495073"
  },
  {
    "code": "320",
    "name": "China Construction Bank (Brasil) Banco Múltiplo S/A",
    "shortName": "BCO CCB BRASIL S.A.",
    "ispb": "07450604"
  },
  {
    "code": "321",
    "name": "CREFAZ SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E A EMPRESA DE PEQUENO PORTE LT",
    "shortName": "CREFAZ SCMEPP LTDA",
    "ispb": "18188384"
  },
  {
    "code": "322",
    "name": "Cooperativa de Crédito Rural de Abelardo Luz - Sulcredi/Crediluz",
    "shortName": "CCR DE ABELARDO LUZ",
    "ispb": "01073966"
  },
  {
    "code": "323",
    "name": "MERCADO PAGO INSTITUIÇÃO DE PAGAMENTO LTDA.",
    "shortName": "MERCADO PAGO IP LTDA.",
    "ispb": "10573521"
  },
  {
    "code": "324",
    "name": "CARTOS SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "CARTOS SCD S.A.",
    "ispb": "21332862"
  },
  {
    "code": "325",
    "name": "Órama Distribuidora de Títulos e Valores Mobiliários S.A.",
    "shortName": "ÓRAMA DTVM S.A.",
    "ispb": "13293225"
  },
  {
    "code": "326",
    "name": "PARATI - CREDITO, FINANCIAMENTO E INVESTIMENTO S.A.",
    "shortName": "PARATI - CFI S.A.",
    "ispb": "03311443"
  },
  {
    "code": "328",
    "name": "COOPERATIVA DE ECONOMIA E CRÉDITO MÚTUO DOS FABRICANTES DE CALÇADOS DE SAPIRANGA",
    "shortName": "CECM FABRIC CALÇADOS SAPIRANGA",
    "ispb": "05841967"
  },
  {
    "code": "329",
    "name": "QI Sociedade de Crédito Direto S.A.",
    "shortName": "QI SCD S.A.",
    "ispb": "32402502"
  },
  {
    "code": "330",
    "name": "BANCO BARI DE INVESTIMENTOS E FINANCIAMENTOS S.A.",
    "shortName": "BANCO BARI S.A.",
    "ispb": "00556603"
  },
  {
    "code": "331",
    "name": "Fram Capital Distribuidora de Títulos e Valores Mobiliários S.A.",
    "shortName": "FRAM CAPITAL DTVM S.A.",
    "ispb": "13673855"
  },
  {
    "code": "332",
    "name": "ACESSO SOLUÇÕES DE PAGAMENTO S.A. - INSTITUIÇÃO DE PAGAMENTO",
    "shortName": "ACESSO SOLUÇÕES DE PAGAMENTO S.A. - INSTITUIÇÃO DE PAGAMENTO",
    "ispb": "13140088"
  },
  {
    "code": "334",
    "name": "BANCO BESA S.A.",
    "shortName": "BANCO BESA S.A.",
    "ispb": "15124464"
  },
  {
    "code": "335",
    "name": "Banco Digio S.A.",
    "shortName": "BANCO DIGIO",
    "ispb": "27098060"
  },
  {
    "code": "336",
    "name": "Banco C6 S.A.",
    "shortName": "BCO C6 S.A.",
    "ispb": "31872495"
  },
  {
    "code": "340",
    "name": "SUPERDIGITAL INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "SUPERDIGITAL I.P. S.A.",
    "ispb": "09554480"
  },
  {
    "code": "341",
    "name": "ITAÚ UNIBANCO S.A.",
    "shortName": "ITAÚ UNIBANCO S.A.",
    "ispb": "60701190"
  },
  {
    "code": "342",
    "name": "Creditas Sociedade de Crédito Direto S.A.",
    "shortName": "CREDITAS SCD",
    "ispb": "32997490"
  },
  {
    "code": "343",
    "name": "FFA SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LTDA.",
    "shortName": "FFA SCMEPP LTDA.",
    "ispb": "24537861"
  },
  {
    "code": "348",
    "name": "Banco XP S.A.",
    "shortName": "BCO XP S.A.",
    "ispb": "33264668"
  },
  {
    "code": "349",
    "name": "AL5 S.A. CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "AL5 S.A. CFI",
    "ispb": "27214112"
  },
  {
    "code": "350",
    "name": "COOPERATIVA DE CRÉDITO RURAL DE PEQUENOS AGRICULTORES E DA REFORMA AGRÁRIA DO CE",
    "shortName": "CREHNOR LARANJEIRAS",
    "ispb": "01330387"
  },
  {
    "code": "352",
    "name": "TORO CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "TORO CTVM S.A.",
    "ispb": "29162769"
  },
  {
    "code": "355",
    "name": "ÓTIMO SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "ÓTIMO SCD S.A.",
    "ispb": "34335592"
  },
  {
    "code": "358",
    "name": "MIDWAY S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "MIDWAY S.A. - SCFI",
    "ispb": "09464032"
  },
  {
    "code": "359",
    "name": "ZEMA CRÉDITO, FINANCIAMENTO E INVESTIMENTO S/A",
    "shortName": "ZEMA CFI S/A",
    "ispb": "05351887"
  },
  {
    "code": "360",
    "name": "TRINUS CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "TRINUS CAPITAL DTVM",
    "ispb": "02276653"
  },
  {
    "code": "362",
    "name": "CIELO S.A. - INSTITUIÇÃO DE PAGAMENTO",
    "shortName": "CIELO IP S.A.",
    "ispb": "01027058"
  },
  {
    "code": "363",
    "name": "SINGULARE CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "SINGULARE CTVM S.A.",
    "ispb": "62285390"
  },
  {
    "code": "364",
    "name": "EFÍ S.A. - INSTITUIÇÃO DE PAGAMENTO",
    "shortName": "EFÍ S.A. - IP",
    "ispb": "09089356"
  },
  {
    "code": "365",
    "name": "SIMPAUL CORRETORA DE CAMBIO E VALORES MOBILIARIOS S.A.",
    "shortName": "SIMPAUL",
    "ispb": "68757681"
  },
  {
    "code": "366",
    "name": "BANCO SOCIETE GENERALE BRASIL S.A.",
    "shortName": "BCO SOCIETE GENERALE BRASIL",
    "ispb": "61533584"
  },
  {
    "code": "367",
    "name": "VITREO DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "VITREO DTVM S.A.",
    "ispb": "34711571"
  },
  {
    "code": "368",
    "name": "Banco CSF S.A.",
    "shortName": "BCO CSF S.A.",
    "ispb": "08357240"
  },
  {
    "code": "370",
    "name": "Banco Mizuho do Brasil S.A.",
    "shortName": "BCO MIZUHO S.A.",
    "ispb": "61088183"
  },
  {
    "code": "371",
    "name": "WARREN CORRETORA DE VALORES MOBILIÁRIOS E CÂMBIO LTDA.",
    "shortName": "WARREN CVMC LTDA",
    "ispb": "92875780"
  },
  {
    "code": "373",
    "name": "UP.P SOCIEDADE DE EMPRÉSTIMO ENTRE PESSOAS S.A.",
    "shortName": "UP.P SEP S.A.",
    "ispb": "35977097"
  },
  {
    "code": "374",
    "name": "REALIZE CRÉDITO, FINANCIAMENTO E INVESTIMENTO S.A.",
    "shortName": "REALIZE CFI S.A.",
    "ispb": "27351731"
  },
  {
    "code": "376",
    "name": "BANCO J.P. MORGAN S.A.",
    "shortName": "BCO J.P. MORGAN S.A.",
    "ispb": "33172537"
  },
  {
    "code": "377",
    "name": "BMS SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "BMS SCD S.A.",
    "ispb": "17826860"
  },
  {
    "code": "378",
    "name": "BANCO BRASILEIRO DE CRÉDITO SOCIEDADE ANÔNIMA",
    "shortName": "BCO BRASILEIRO DE CRÉDITO S.A.",
    "ispb": "01852137"
  },
  {
    "code": "379",
    "name": "COOPERFORTE - COOPERATIVA DE ECONOMIA E CRÉDITO MÚTUO DE FUNCIONÁRIOS DE INSTITU",
    "shortName": "CECM COOPERFORTE",
    "ispb": "01658426"
  },
  {
    "code": "380",
    "name": "PICPAY INSTITUIçãO DE PAGAMENTO S.A.",
    "shortName": "PICPAY",
    "ispb": "22896431"
  },
  {
    "code": "381",
    "name": "BANCO MERCEDES-BENZ DO BRASIL S.A.",
    "shortName": "BCO MERCEDES-BENZ S.A.",
    "ispb": "60814191"
  },
  {
    "code": "382",
    "name": "FIDÚCIA SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE L",
    "shortName": "FIDUCIA SCMEPP LTDA",
    "ispb": "04307598"
  },
  {
    "code": "383",
    "name": "EBANX INSTITUICAO DE PAGAMENTOS LTDA.",
    "shortName": "EBANX IP LTDA.",
    "ispb": "21018182"
  },
  {
    "code": "384",
    "name": "GLOBAL FINANÇAS SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO",
    "shortName": "GLOBAL SCM LTDA",
    "ispb": "11165756"
  },
  {
    "code": "385",
    "name": "COOPERATIVA DE ECONOMIA E CREDITO MUTUO DOS TRABALHADORES PORTUARIOS DA GRANDE V",
    "shortName": "CECM DOS TRAB.PORT. DA G.VITOR",
    "ispb": "03844699"
  },
  {
    "code": "386",
    "name": "NU FINANCEIRA S.A. - Sociedade de Crédito, Financiamento e Investimento",
    "shortName": "NU FINANCEIRA S.A. CFI",
    "ispb": "30680829"
  },
  {
    "code": "387",
    "name": "Banco Toyota do Brasil S.A.",
    "shortName": "BCO TOYOTA DO BRASIL S.A.",
    "ispb": "03215790"
  },
  {
    "code": "389",
    "name": "Banco Mercantil do Brasil S.A.",
    "shortName": "BCO MERCANTIL DO BRASIL S.A.",
    "ispb": "17184037"
  },
  {
    "code": "390",
    "name": "BANCO GM S.A.",
    "shortName": "BCO GM S.A.",
    "ispb": "59274605"
  },
  {
    "code": "391",
    "name": "COOPERATIVA DE CREDITO RURAL DE IBIAM - SULCREDI/IBIAM",
    "shortName": "CCR DE IBIAM",
    "ispb": "08240446"
  },
  {
    "code": "393",
    "name": "Banco Volkswagen S.A.",
    "shortName": "BCO VOLKSWAGEN S.A",
    "ispb": "59109165"
  },
  {
    "code": "394",
    "name": "Banco Bradesco Financiamentos S.A.",
    "shortName": "BCO BRADESCO FINANC. S.A.",
    "ispb": "07207996"
  },
  {
    "code": "395",
    "name": "F.D'GOLD - DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "F D GOLD DTVM LTDA",
    "ispb": "08673569"
  },
  {
    "code": "396",
    "name": "HUB INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "HUB IP S.A.",
    "ispb": "13884775"
  },
  {
    "code": "397",
    "name": "LISTO SOCIEDADE DE CREDITO DIRETO S.A.",
    "shortName": "LISTO SCD S.A.",
    "ispb": "34088029"
  },
  {
    "code": "398",
    "name": "IDEAL CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "IDEAL CTVM S.A.",
    "ispb": "31749596"
  },
  {
    "code": "399",
    "name": "Kirton Bank S.A. - Banco Múltiplo",
    "shortName": "KIRTON BANK",
    "ispb": "01701201"
  },
  {
    "code": "400",
    "name": "COOPERATIVA DE CRÉDITO, POUPANÇA E SERVIÇOS FINANCEIROS DO CENTRO OESTE - CREDIT",
    "shortName": "COOP CREDITAG",
    "ispb": "05491616"
  },
  {
    "code": "401",
    "name": "IUGU INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "IUGU IP S.A.",
    "ispb": "15111975"
  },
  {
    "code": "402",
    "name": "COBUCCIO S/A - SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTOS",
    "shortName": "COBUCCIO S.A. SCFI",
    "ispb": "36947229"
  },
  {
    "code": "403",
    "name": "CORA SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "CORA SCD S.A.",
    "ispb": "37880206"
  },
  {
    "code": "404",
    "name": "SUMUP SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "SUMUP SCD S.A.",
    "ispb": "37241230"
  },
  {
    "code": "406",
    "name": "ACCREDITO - SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "ACCREDITO SCD S.A.",
    "ispb": "37715993"
  },
  {
    "code": "407",
    "name": "ÍNDIGO INVESTIMENTOS DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "ÍNDIGO INVESTIMENTOS DTVM LTDA.",
    "ispb": "00329598"
  },
  {
    "code": "408",
    "name": "BONUSPAGO SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "BONUSPAGO SCD S.A.",
    "ispb": "36586946"
  },
  {
    "code": "410",
    "name": "PLANNER SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "PLANNER SOCIEDADE DE CRÉDITO DIRETO",
    "ispb": "05684234"
  },
  {
    "code": "411",
    "name": "Via Certa Financiadora S.A. - Crédito, Financiamento e Investimentos",
    "shortName": "VIA CERTA FINANCIADORA S.A. - CFI",
    "ispb": "05192316"
  },
  {
    "code": "412",
    "name": "SOCIAL BANK BANCO MÚLTIPLO S/A",
    "shortName": "SOCIAL BANK S/A",
    "ispb": "15173776"
  },
  {
    "code": "413",
    "name": "BANCO BV S.A.",
    "shortName": "BCO BV S.A.",
    "ispb": "01858774"
  },
  {
    "code": "414",
    "name": "LEND SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "LEND SCD S.A.",
    "ispb": "37526080"
  },
  {
    "code": "416",
    "name": "LAMARA SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "LAMARA SCD S.A.",
    "ispb": "19324634"
  },
  {
    "code": "418",
    "name": "ZIPDIN SOLUÇÕES DIGITAIS SOCIEDADE DE CRÉDITO DIRETO S/A",
    "shortName": "ZIPDIN SCD S.A.",
    "ispb": "37414009"
  },
  {
    "code": "419",
    "name": "NUMBRS SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "NUMBRS SCD S.A.",
    "ispb": "38129006"
  },
  {
    "code": "421",
    "name": "LAR COOPERATIVA DE CRÉDITO - LAR CREDI",
    "shortName": "CC LAR CREDI",
    "ispb": "39343350"
  },
  {
    "code": "422",
    "name": "Banco Safra S.A.",
    "shortName": "BCO SAFRA S.A.",
    "ispb": "58160789"
  },
  {
    "code": "423",
    "name": "COLUNA S/A DISTRIBUIDORA DE TITULOS E VALORES MOBILIÁRIOS",
    "shortName": "COLUNA S.A. DTVM",
    "ispb": "00460065"
  },
  {
    "code": "425",
    "name": "SOCINAL S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "SOCINAL S.A. CFI",
    "ispb": "03881423"
  },
  {
    "code": "426",
    "name": "NEON FINANCEIRA - CRÉDITO, FINANCIAMENTO E INVESTIMENTO S.A.",
    "shortName": "NEON FINANCEIRA - CFI S.A.",
    "ispb": "11285104"
  },
  {
    "code": "427",
    "name": "COOPERATIVA DE CREDITO DOS SERVIDORES DA UNIVERSIDADE FEDERAL DO ESPIRITO SANTO",
    "shortName": "CRED-UFES",
    "ispb": "27302181"
  },
  {
    "code": "428",
    "name": "CREDSYSTEM SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "CREDSYSTEM SCD S.A.",
    "ispb": "39664698"
  },
  {
    "code": "429",
    "name": "Crediare S.A. - Crédito, financiamento e investimento",
    "shortName": "CREDIARE CFI S.A.",
    "ispb": "05676026"
  },
  {
    "code": "430",
    "name": "COOPERATIVA DE CREDITO RURAL SEARA - CREDISEARA",
    "shortName": "CCR SEARA",
    "ispb": "00204963"
  },
  {
    "code": "433",
    "name": "BR-CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "BR-CAPITAL DTVM S.A.",
    "ispb": "44077014"
  },
  {
    "code": "435",
    "name": "DELCRED SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "DELCRED SCD S.A.",
    "ispb": "38224857"
  },
  {
    "code": "438",
    "name": "TRUSTEE DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "TRUSTEE DTVM LTDA.",
    "ispb": "67030395"
  },
  {
    "code": "439",
    "name": "ID CORRETORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "ID CTVM",
    "ispb": "16695922"
  },
  {
    "code": "440",
    "name": "CREDIBRF - COOPERATIVA DE CRÉDITO",
    "shortName": "CREDIBRF COOP",
    "ispb": "82096447"
  },
  {
    "code": "442",
    "name": "MAGNETIS - DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA",
    "shortName": "MAGNETIS - DTVM",
    "ispb": "87963450"
  },
  {
    "code": "443",
    "name": "CREDIHOME SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "CREDIHOME SCD",
    "ispb": "39416705"
  },
  {
    "code": "444",
    "name": "TRINUS SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "TRINUS SCD S.A.",
    "ispb": "40654622"
  },
  {
    "code": "445",
    "name": "PLANTAE S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "PLANTAE CFI",
    "ispb": "35551187"
  },
  {
    "code": "447",
    "name": "MIRAE ASSET WEALTH MANAGEMENT (BRAZIL) CORRETORA DE CÂMBIO, TÍTULOS E VALORES MO",
    "shortName": "MIRAE ASSET CCTVM LTDA",
    "ispb": "12392983"
  },
  {
    "code": "448",
    "name": "HEMERA DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "HEMERA DTVM LTDA.",
    "ispb": "39669186"
  },
  {
    "code": "449",
    "name": "DM SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "DM",
    "ispb": "37555231"
  },
  {
    "code": "450",
    "name": "FITBANK INSTITUIÇÃO DE PAGAMENTOS ELETRÔNICOS S.A.",
    "shortName": "FITBANK IP",
    "ispb": "13203354"
  },
  {
    "code": "451",
    "name": "J17 - SOCIEDADE DE CRÉDITO DIRETO S/A",
    "shortName": "J17 - SCD S/A",
    "ispb": "40475846"
  },
  {
    "code": "452",
    "name": "CREDIFIT SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "CREDIFIT SCD S.A.",
    "ispb": "39676772"
  },
  {
    "code": "454",
    "name": "MÉRITO DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "MÉRITO DTVM LTDA.",
    "ispb": "41592532"
  },
  {
    "code": "455",
    "name": "FÊNIX DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "FÊNIX DTVM LTDA.",
    "ispb": "38429045"
  },
  {
    "code": "456",
    "name": "Banco MUFG Brasil S.A.",
    "shortName": "BCO MUFG BRASIL S.A.",
    "ispb": "60498557"
  },
  {
    "code": "457",
    "name": "UY3 SOCIEDADE DE CRÉDITO DIRETO S/A",
    "shortName": "UY3 SCD S/A",
    "ispb": "39587424"
  },
  {
    "code": "458",
    "name": "HEDGE INVESTMENTS DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "HEDGE INVESTMENTS DTVM LTDA.",
    "ispb": "07253654"
  },
  {
    "code": "459",
    "name": "COOPERATIVA DE CRÉDITO MÚTUO DE SERVIDORES PÚBLICOS DO ESTADO DE SÃO PAULO - CRE",
    "shortName": "CCM SERV. PÚBLICOS SP",
    "ispb": "04546162"
  },
  {
    "code": "460",
    "name": "UNAVANTI SOCIEDADE DE CRÉDITO DIRETO S/A",
    "shortName": "UNAVANTI SCD S/A",
    "ispb": "42047025"
  },
  {
    "code": "461",
    "name": "ASAAS GESTÃO FINANCEIRA INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "ASAAS IP S.A.",
    "ispb": "19540550"
  },
  {
    "code": "462",
    "name": "STARK SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "STARK SCD S.A.",
    "ispb": "39908427"
  },
  {
    "code": "463",
    "name": "AZUMI DISTRIBUIDORA DE TíTULOS E VALORES MOBILIáRIOS LTDA.",
    "shortName": "AZUMI DTVM",
    "ispb": "40434681"
  },
  {
    "code": "464",
    "name": "Banco Sumitomo Mitsui Brasileiro S.A.",
    "shortName": "BCO SUMITOMO MITSUI BRASIL S.A.",
    "ispb": "60518222"
  },
  {
    "code": "465",
    "name": "CAPITAL CONSIG SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "CAPITAL CONSIG SCD S.A.",
    "ispb": "40083667"
  },
  {
    "code": "467",
    "name": "MASTER S/A CORRETORA DE CâMBIO, TíTULOS E VALORES MOBILIáRIOS",
    "shortName": "MASTER S/A CCTVM",
    "ispb": "33886862"
  },
  {
    "code": "468",
    "name": "PORTOSEG S.A. - CREDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "PORTOSEG S.A. CFI",
    "ispb": "04862600"
  },
  {
    "code": "469",
    "name": "LIGA INVEST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA",
    "shortName": "LIGA INVEST DTVM LTDA.",
    "ispb": "07138049"
  },
  {
    "code": "470",
    "name": "CDC SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "CDC SCD S.A.",
    "ispb": "18394228"
  },
  {
    "code": "471",
    "name": "COOPERATIVA DE ECONOMIA E CREDITO MUTUO DOS SERVIDORES PUBLICOS DE PINHÃO - CRES",
    "shortName": "CECM SERV PUBL PINHÃO",
    "ispb": "04831810"
  },
  {
    "code": "473",
    "name": "Banco Caixa Geral - Brasil S.A.",
    "shortName": "BCO CAIXA GERAL BRASIL S.A.",
    "ispb": "33466988"
  },
  {
    "code": "475",
    "name": "Banco Yamaha Motor do Brasil S.A.",
    "shortName": "BCO YAMAHA MOTOR S.A.",
    "ispb": "10371492"
  },
  {
    "code": "477",
    "name": "Citibank N.A.",
    "shortName": "CITIBANK N.A.",
    "ispb": "33042953"
  },
  {
    "code": "478",
    "name": "GAZINCRED S.A. SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "GAZINCRED S.A. SCFI",
    "ispb": "11760553"
  },
  {
    "code": "479",
    "name": "Banco ItauBank S.A.",
    "shortName": "BCO ITAUBANK S.A.",
    "ispb": "60394079"
  },
  {
    "code": "481",
    "name": "SUPERLÓGICA SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "SUPERLÓGICA SCD S.A.",
    "ispb": "43599047"
  },
  {
    "code": "482",
    "name": "SBCASH SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "SBCASH SCD",
    "ispb": "42259084"
  },
  {
    "code": "484",
    "name": "MAF DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "MAF DTVM SA",
    "ispb": "36864992"
  },
  {
    "code": "487",
    "name": "DEUTSCHE BANK S.A. - BANCO ALEMAO",
    "shortName": "DEUTSCHE BANK S.A.BCO ALEMAO",
    "ispb": "62331228"
  },
  {
    "code": "488",
    "name": "JPMorgan Chase Bank, National Association",
    "shortName": "JPMORGAN CHASE BANK",
    "ispb": "46518205"
  },
  {
    "code": "495",
    "name": "Banco de La Provincia de Buenos Aires",
    "shortName": "BCO LA PROVINCIA B AIRES BCE",
    "ispb": "44189447"
  },
  {
    "code": "505",
    "name": "Banco Credit Suisse (Brasil) S.A.",
    "shortName": "BCO CREDIT SUISSE S.A.",
    "ispb": "32062580"
  },
  {
    "code": "506",
    "name": "RJI CORRETORA DE TITULOS E VALORES MOBILIARIOS LTDA",
    "shortName": "RJI",
    "ispb": "42066258"
  },
  {
    "code": "507",
    "name": "SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO EFÍ S.A.",
    "shortName": "SCFI EFÍ S.A.",
    "ispb": "37229413"
  },
  {
    "code": "508",
    "name": "AVENUE SECURITIES DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "AVENUE SECURITIES DTVM LTDA.",
    "ispb": "61384004"
  },
  {
    "code": "509",
    "name": "CELCOIN INSTITUICAO DE PAGAMENTO S.A.",
    "shortName": "CELCOIN IP S.A.",
    "ispb": "13935893"
  },
  {
    "code": "510",
    "name": "FFCRED SOCIEDADE DE CRÉDITO DIRETO S.A..",
    "shortName": "FFCRED SCD S.A.",
    "ispb": "39738065"
  },
  {
    "code": "511",
    "name": "MAGNUM SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "MAGNUM SCD",
    "ispb": "44683140"
  },
  {
    "code": "512",
    "name": "FINVEST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "FINVEST DTVM",
    "ispb": "36266751"
  },
  {
    "code": "513",
    "name": "ATF CREDIT SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "ATF CREDIT SCD S.A.",
    "ispb": "44728700"
  },
  {
    "code": "516",
    "name": "QISTA S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO",
    "shortName": "QISTA S.A. CFI",
    "ispb": "36583700"
  },
  {
    "code": "518",
    "name": "MERCADO CRÉDITO SOCIEDADE DE CRÉDITO, FINANCIAMENTO E INVESTIMENTO S.A.",
    "shortName": "MERCADO CRÉDITO SCFI S.A.",
    "ispb": "37679449"
  },
  {
    "code": "519",
    "name": "LIONS TRUST DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS LTDA.",
    "shortName": "LIONS TRUST DTVM",
    "ispb": "40768766"
  },
  {
    "code": "521",
    "name": "PEAK SOCIEDADE DE EMPRÉSTIMO ENTRE PESSOAS S.A.",
    "shortName": "PEAK SEP S.A.",
    "ispb": "44019481"
  },
  {
    "code": "522",
    "name": "RED SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "RED SCD S.A.",
    "ispb": "47593544"
  },
  {
    "code": "523",
    "name": "HR DIGITAL - SOCIEDADE DE CRÉDITO DIRETO S/A",
    "shortName": "HR DIGITAL SCD",
    "ispb": "44292580"
  },
  {
    "code": "524",
    "name": "WNT CAPITAL DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "WNT CAPITAL DTVM",
    "ispb": "45854066"
  },
  {
    "code": "525",
    "name": "INTERCAM CORRETORA DE CÂMBIO LTDA.",
    "shortName": "INTERCAM CC LTDA",
    "ispb": "34265629"
  },
  {
    "code": "526",
    "name": "MONETARIE SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "MONETARIE SCD",
    "ispb": "46026562"
  },
  {
    "code": "527",
    "name": "ATICCA - SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "ATICCA SCD S.A.",
    "ispb": "44478623"
  },
  {
    "code": "528",
    "name": "REAG DISTRIBUIDORA DE TÍTULOS E VALORES MOBILIÁRIOS S.A.",
    "shortName": "REAG DTVM S.A.",
    "ispb": "34829992"
  },
  {
    "code": "529",
    "name": "PINBANK BRASIL INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "PINBANK IP",
    "ispb": "17079937"
  },
  {
    "code": "530",
    "name": "SER FINANCE SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "SER FINANCE SCD S.A.",
    "ispb": "47873449"
  },
  {
    "code": "532",
    "name": "EAGLE SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "EAGLE SCD S.A.",
    "ispb": "45745537"
  },
  {
    "code": "534",
    "name": "EWALLY INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "EWALLY IP S.A.",
    "ispb": "00714671"
  },
  {
    "code": "535",
    "name": "MARÚ SOCIEDADE DE CRÉDITO DIRETO S.A.",
    "shortName": "MARU SCD S.A.",
    "ispb": "39519944"
  },
  {
    "code": "536",
    "name": "NEON PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENTO",
    "shortName": "NEON PAGAMENTOS S.A. IP",
    "ispb": "20855875"
  },
  {
    "code": "537",
    "name": "MICROCASH SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE",
    "shortName": "MICROCASH SCMEPP LTDA.",
    "ispb": "45756448"
  },
  {
    "code": "539",
    "name": "SANTINVEST S.A. - CREDITO, FINANCIAMENTO E INVESTIMENTOS",
    "shortName": "SANTINVEST S.A. - CFI",
    "ispb": "00122327"
  },
  {
    "code": "541",
    "name": "FUNDO GARANTIDOR DE CREDITOS - FGC",
    "shortName": "FDO GARANTIDOR CRÉDITOS",
    "ispb": "00954288"
  },
  {
    "code": "545",
    "name": "SENSO CORRETORA DE CAMBIO E VALORES MOBILIARIOS S.A",
    "shortName": "SENSO CCVM S.A.",
    "ispb": "17352220"
  },
  {
    "code": "546",
    "name": "U4C INSTITUIÇÃO DE PAGAMENTO S.A.",
    "shortName": "U4C INSTITUIÇÃO DE PAGAMENTO S.A.",
    "ispb": "30980539"
  },
  {
    "code": "600",
    "name": "Banco Luso Brasileiro S.A.",
    "shortName": "BCO LUSO BRASILEIRO S.A.",
    "ispb": "59118133"
  },
  {
    "code": "604",
    "name": "Banco Industrial do Brasil S.A.",
    "shortName": "BCO INDUSTRIAL DO BRASIL S.A.",
    "ispb": "31895683"
  },
  {
    "code": "610",
    "name": "Banco VR S.A.",
    "shortName": "BCO VR S.A.",
    "ispb": "78626983"
  },
  {
    "code": "611",
    "name": "Banco Paulista S.A.",
    "shortName": "BCO PAULISTA S.A.",
    "ispb": "61820817"
  },
  {
    "code": "612",
    "name": "Banco Guanabara S.A.",
    "shortName": "BCO GUANABARA S.A.",
    "ispb": "31880826"
  },
  {
    "code": "613",
    "name": "Omni Banco S.A.",
    "shortName": "OMNI BANCO S.A.",
    "ispb": "60850229"
  },
  {
    "code": "623",
    "name": "Banco Pan S.A.",
    "shortName": "BANCO PAN",
    "ispb": "59285411"
  },
  {
    "code": "626",
    "name": "BANCO C6 CONSIGNADO S.A.",
    "shortName": "BCO C6 CONSIG",
    "ispb": "61348538"
  },
  {
    "code": "630",
    "name": "BANCO LETSBANK S.A.",
    "shortName": "BCO LETSBANK S.A.",
    "ispb": "58497702"
  },
  {
    "code": "633",
    "name": "Banco Rendimento S.A.",
    "shortName": "BCO RENDIMENTO S.A.",
    "ispb": "68900810"
  },
  {
    "code": "634",
    "name": "BANCO TRIANGULO S.A.",
    "shortName": "BCO TRIANGULO S.A.",
    "ispb": "17351180"
  },
  {
    "code": "637",
    "name": "BANCO SOFISA S.A.",
    "shortName": "BCO SOFISA S.A.",
    "ispb": "60889128"
  },
  {
    "code": "643",
    "name": "Banco Pine S.A.",
    "shortName": "BCO PINE S.A.",
    "ispb": "62144175"
  },
  {
    "code": "653",
    "name": "BANCO VOITER S.A.",
    "shortName": "BANCO VOITER",
    "ispb": "61024352"
  },
  {
    "code": "654",
    "name": "BANCO DIGIMAIS S.A.",
    "shortName": "BCO DIGIMAIS S.A.",
    "ispb": "92874270"
  },
  {
    "code": "655",
    "name": "Banco Votorantim S.A.",
    "shortName": "BCO VOTORANTIM S.A.",
    "ispb": "59588111"
  },
  {
    "code": "707",
    "name": "Banco Daycoval S.A.",
    "shortName": "BCO DAYCOVAL S.A",
    "ispb": "62232889"
  },
  {
    "code": "712",
    "name": "Banco Ourinvest S.A.",
    "shortName": "BCO OURINVEST S.A.",
    "ispb": "78632767"
  },
  {
    "code": "720",
    "name": "BANCO RNX S.A.",
    "shortName": "BCO RNX S.A.",
    "ispb": "80271455"
  },
  {
    "code": "739",
    "name": "Banco Cetelem S.A.",
    "shortName": "BCO CETELEM S.A.",
    "ispb": "00558456"
  },
  {
    "code": "741",
    "name": "BANCO RIBEIRAO PRETO S.A.",
    "shortName": "BCO RIBEIRAO PRETO S.A.",
    "ispb": "00517645"
  },
  {
    "code": "743",
    "name": "Banco Semear S.A.",
    "shortName": "BANCO SEMEAR",
    "ispb": "00795423"
  },
  {
    "code": "745",
    "name": "Banco Citibank S.A.",
    "shortName": "BCO CITIBANK S.A.",
    "ispb": "33479023"
  },
  {
    "code": "746",
    "name": "Banco Modal S.A.",
    "shortName": "BCO MODAL S.A.",
    "ispb": "30723886"
  },
  {
    "code": "747",
    "name": "Banco Rabobank International Brasil S.A.",
    "shortName": "BCO RABOBANK INTL BRASIL S.A.",
    "ispb": "01023570"
  },
  {
    "code": "748",
    "name": "BANCO COOPERATIVO SICREDI S.A.",
    "shortName": "BCO COOPERATIVO SICREDI S.A.",
    "ispb": "01181521"
  },
  {
    "code": "751",
    "name": "Scotiabank Brasil S.A. Banco Múltiplo",
    "shortName": "SCOTIABANK BRASIL",
    "ispb": "29030467"
  },
  {
    "code": "752",
    "name": "Banco BNP Paribas Brasil S.A.",
    "shortName": "BCO BNP PARIBAS BRASIL S A",
    "ispb": "01522368"
  },
  {
    "code": "753",
    "name": "Novo Banco Continental S.A. - Banco Múltiplo",
    "shortName": "NOVO BCO CONTINENTAL S.A. - BM",
    "ispb": "74828799"
  },
  {
    "code": "754",
    "name": "Banco Sistema S.A.",
    "shortName": "BANCO SISTEMA",
    "ispb": "76543115"
  },
  {
    "code": "755",
    "name": "Bank of America Merrill Lynch Banco Múltiplo S.A.",
    "shortName": "BOFA MERRILL LYNCH BM S.A.",
    "ispb": "62073200"
  },
  {
    "code": "756",
    "name": "BANCO COOPERATIVO SICOOB S.A. - BANCO SICOOB",
    "shortName": "BANCO SICOOB S.A.",
    "ispb": "02038232"
  },
  {
    "code": "757",
    "name": "BANCO KEB HANA DO BRASIL S.A.",
    "shortName": "BCO KEB HANA DO BRASIL S.A.",
    "ispb": "02318507"
  }
];
