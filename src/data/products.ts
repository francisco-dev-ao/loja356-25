import { Product } from '@/hooks/use-cart';

// Mock product data
const products: Product[] = [
  {
    id: 'm365-basic',
    name: 'Microsoft 365 - Pacote Básico',
    description: 'Pacote Microsoft 365 com aplicativos essenciais para pequenas empresas. Inclui Word, Excel, PowerPoint, Outlook e 1TB de armazenamento OneDrive por usuário.',
    price: 149.90,
    image: 'office365.png', // Caminho atualizado para office.png
    category: 'Microsoft 365',
    quantity: 0
  },
  {
    id: 'm365-business',
    name: 'Microsoft 365 - Pacote Business',
    description: 'Solução completa para empresas em crescimento. Inclui todos os aplicativos do Microsoft 365, com recursos avançados de segurança e colaboração.',
    price: 249.90,
    image: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4FKnS?ver=2d32',
    category: 'Microsoft 365',
    quantity: 0
  },
  {
    id: 'm365-enterprise',
    name: 'Microsoft 365 - Pacote Enterprise',
    description: 'A solução mais completa para grandes organizações. Inclui todos os recursos do Business, com recursos adicionais de governança, compliance e análise avançada.',
    price: 399.90,
    image: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RWHAM3?ver=1b38',
    category: 'Microsoft 365',
    quantity: 0
  },
  {
    id: 'exchange-standard',
    name: 'Exchange Server 2019 - Standard',
    description: 'Serviço de e-mail corporativo com recursos avançados de organização e segurança para pequenas e médias empresas.',
    price: 1299.90,
    image: 'https://lh3.googleusercontent.com/guNWx-3qZkCpQRogV3SrxCfw_5WQY5lxIIVVIHbzQBTAv4pj2UmxGGS8jjA0SeOzKrDnfnu9QF-c6I6SMGSNgX1r-wxpLgUIhwNp=w812-l80-sg-rj',
    category: 'Exchange Server',
    quantity: 0
  },
  {
    id: 'exchange-enterprise',
    name: 'Exchange Server 2019 - Enterprise',
    description: 'Solução completa de e-mail e calendário para grandes organizações com recursos avançados de segurança, compliance e alta disponibilidade.',
    price: 4999.90,
    image: 'https://www.coreit.se/wp-content/uploads/2020/02/Microsoft-Exchange-Server-2019.png',
    category: 'Exchange Server',
    quantity: 0
  },
  {
    id: 'windows-10-pro',
    name: 'Windows 10 Pro',
    description: 'Sistema operacional Windows 10 Professional com recursos avançados para empresas e profissionais.',
    price: 899.90,
    image: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4wsm5?ver=5b5f',
    category: 'Windows',
    quantity: 0
  },
  {
    id: 'windows-11-pro',
    name: 'Windows 11 Pro',
    description: 'A versão mais recente do Windows, com design moderno e recursos avançados de produtividade e segurança.',
    price: 1099.90,
    image: 'https://cdn.wccftech.com/wp-content/uploads/2021/06/windows-11-1030x579.jpg',
    category: 'Windows',
    quantity: 0
  },
  {
    id: 'windows-2025-preview',
    name: 'Windows 2025 (Preview)',
    description: 'Acesso antecipado ao Windows 2025 com recursos de IA integrados e experiência de usuário revolucionária.',
    price: 1499.90,
    image: 'https://cdn.mos.cms.futurecdn.net/sPrhFXFPgt3BEWyk8zidHU-1200-80.jpg',
    category: 'Windows',
    quantity: 0
  }
];

export default products;
