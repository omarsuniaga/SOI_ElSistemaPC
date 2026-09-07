import { 
  MarketplaceId, 
  NormalizedProductResult, 
  LandedCostEstimate, 
  ResultSourceType,
  SavedProduct
} from '../types';
import { exchangeRateService } from './exchangeRateProvider';

export interface MarketplaceCapability {
  marketplace: MarketplaceId;
  name: string;
  officialSearchApi: string;
  priceApi: string;
  authRequired: string;
  suitableForFin: 'Alta' | 'Media' | 'Baja' | 'Solo Enlace Externo';
  fallbackBehavior: string;
  directSearchUrlPattern: string;
  logoUrl?: string;
  defaultDeliveryDays: number;
  notes: string;
}

export const MARKETPLACE_CAPABILITIES: MarketplaceCapability[] = [
  {
    marketplace: 'amazon',
    name: 'Amazon',
    officialSearchApi: 'Amazon Creators API / PA-API v5.0 (GetItems, SearchItems)',
    priceApi: 'Sí (Requiere Creators API / PA-API v5 con AWS IAM + Partner Tag)',
    authRequired: 'AWS Access Key, Secret Key, Partner Tag (Creators Program)',
    suitableForFin: 'Alta',
    fallbackBehavior: 'Búsqueda estructurada directa en Amazon.com + ASIN lookup',
    directSearchUrlPattern: 'https://www.amazon.com/s?k=',
    defaultDeliveryDays: 5,
    notes: 'Ideal para suministros rápidos, libros de partituras, accesorios y tecnología con entrega prioritaria Miami/Courier.'
  },
  {
    marketplace: 'aliexpress',
    name: 'AliExpress',
    officialSearchApi: 'AliExpress Open Platform API (Isv.aliexpress.affiliate.product.query)',
    priceApi: 'Sí (App Key / App Secret con firma HMAC-SHA256)',
    authRequired: 'App Key, Secret, Developer Authorization',
    suitableForFin: 'Alta',
    fallbackBehavior: 'Búsqueda por palabras clave con filtros de envío y valoración en AliExpress.com',
    directSearchUrlPattern: 'https://www.aliexpress.com/wholesale?SearchText=',
    defaultDeliveryDays: 16,
    notes: 'Excelente relación costo/beneficio para repuestos de lutería, cuerdas de estudio, afinadores y estuches.'
  },
  {
    marketplace: 'alibaba',
    name: 'Alibaba',
    officialSearchApi: 'Alibaba Wholesale & Trade Assurance API',
    priceApi: 'Sí (Precios escalonados por MOQ - Minimum Order Quantity)',
    authRequired: 'Alibaba Enterprise Partner Token',
    suitableForFin: 'Alta',
    fallbackBehavior: 'Búsqueda mayorista B2B en Alibaba.com con filtro MOQ',
    directSearchUrlPattern: 'https://www.alibaba.com/trade/search?SearchText=',
    defaultDeliveryDays: 30,
    notes: 'Imprescindible para compras institucionales por volumen (20+ atriles, 50+ sets de cuerdas, uniformes).'
  },
  {
    marketplace: 'ebay',
    name: 'eBay',
    officialSearchApi: 'eBay Buy Browse API v1 (Item Summary Search)',
    priceApi: 'Sí (REST con Application Access Token OAuth2)',
    authRequired: 'Client ID, Client Secret (OAuth 2.0 Client Credentials)',
    suitableForFin: 'Alta',
    fallbackBehavior: 'Búsqueda directa con filtro de compra inmediata (Buy It Now) en eBay.com',
    directSearchUrlPattern: 'https://www.ebay.com/sch/i.html?_nkw=',
    defaultDeliveryDays: 7,
    notes: 'Muy útil para repuestos específicos de instrumentos de época, maderas de lutería y equipos de audio descontinuados.'
  },
  {
    marketplace: 'temu',
    name: 'Temu',
    officialSearchApi: 'No disponible (Plataforma cerrada a APIs de terceros)',
    priceApi: 'No disponible públicamente',
    authRequired: 'No aplicable (Restringido)',
    suitableForFin: 'Solo Enlace Externo',
    fallbackBehavior: 'Generador de enlaces de búsqueda optimizados a la web oficial',
    directSearchUrlPattern: 'https://www.temu.com/search_result.html?search_key=',
    defaultDeliveryDays: 14,
    notes: 'Precios ultra-bajos en papelería, cables genéricos y organizadores. Compras se ejecutan manualmente en la web oficial.'
  },
  {
    marketplace: 'shein',
    name: 'SHEIN',
    officialSearchApi: 'No disponible para bienes generales',
    priceApi: 'No disponible públicamente',
    authRequired: 'No aplicable (Restringido)',
    suitableForFin: 'Solo Enlace Externo',
    fallbackBehavior: 'Generador de enlaces por categoría/búsqueda en SHEIN.com',
    directSearchUrlPattern: 'https://us.shein.com/pdsearch/',
    defaultDeliveryDays: 12,
    notes: 'Utilizado para telas para estuches, organizadores acústicos textiles y vestuario de presentaciones orquestales.'
  },
  {
    marketplace: 'local_do',
    name: 'Suplidores Locales RD',
    officialSearchApi: 'Ingreso Manual de Cotización Institucional (RNC / NCF)',
    priceApi: 'Cotización Formal en DOP (Pesos Dominicanos)',
    authRequired: 'RNC registrado en DGII',
    suitableForFin: 'Alta',
    fallbackBehavior: 'Captura manual de cotización física o electrónica con validez',
    directSearchUrlPattern: '#local-quote',
    defaultDeliveryDays: 2,
    notes: 'Proveedores dominicanos (Instrumentos Fernando, Casa Nelson, Papelería Bávaro). Despacho inmediato y comprobante fiscal B01.'
  }
];

// Obtener tasa actual desde el proveedor dinámico institucional
export function getTasaCambioActual(): number {
  return exchangeRateService.getCurrentRate().rate;
}

// Compatibilidad hacia atrás (getter dinámico)
export const TASA_CAMBIO_DOLAR_RD = getTasaCambioActual();

// Utilidad para calcular Landed Cost oficial de importación a RD
export function calcularLandedCost(params: {
  precioUnitarioUsd: number;
  cantidad: number;
  costoEnvioUsd?: number;
  pesoLibrasEstimado?: number;
  aplicaArancel?: boolean; // Generalmente exento o 10-20% para insumos educativos/culturales
  tasaCambio?: number;
}): LandedCostEstimate {
  const currentRate = params.tasaCambio || getTasaCambioActual();
  const {
    precioUnitarioUsd,
    cantidad,
    costoEnvioUsd = 0,
    pesoLibrasEstimado = 1,
    aplicaArancel = false,
    tasaCambio = currentRate
  } = params;

  const subtotalUsd = precioUnitarioUsd * cantidad;
  
  // Courier de Miami a Punta Cana: ~USD 3.25 / libra + ITBIS
  const localHandlingUsd = Math.max(3.50, pesoLibrasEstimado * 3.25);
  
  // Arancel e ITBIS aduanal RD si el paquete pasa de USD 200 (Categoría B vs C DGA)
  const customsTaxUsd = (subtotalUsd + costoEnvioUsd > 200 && aplicaArancel)
    ? (subtotalUsd + costoEnvioUsd) * 0.18 // 18% ITBIS
    : 0;

  const totalLandedUsd = subtotalUsd + costoEnvioUsd + localHandlingUsd + customsTaxUsd;
  const totalLandedDop = Math.round(totalLandedUsd * tasaCambio);

  return {
    unitPriceUsd: precioUnitarioUsd,
    quantity: cantidad,
    subtotalUsd: Number(subtotalUsd.toFixed(2)),
    shippingUsd: Number(costoEnvioUsd.toFixed(2)),
    customsTaxUsd: Number(customsTaxUsd.toFixed(2)),
    localHandlingUsd: Number(localHandlingUsd.toFixed(2)),
    totalLandedUsd: Number(totalLandedUsd.toFixed(2)),
    exchangeRateDop: tasaCambio,
    totalLandedDop
  };
}

// Catálogo Curado de Productos Institucionales para Búsquedas Rápidas y Comparaciones
export const INITIAL_PROCUREMENT_CATALOG: NormalizedProductResult[] = [
  // 1. Cuerdas de Violín 4/4
  {
    id: 'prod-001',
    marketplace: 'aliexpress',
    marketplaceName: 'AliExpress',
    title: 'Alice A703 Violin Strings 4/4 Full Set (Steel Core / Silver Alloy Wound)',
    imageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 4.85,
    shippingCostUsd: 1.50,
    estimatedTotalUsd: 6.35,
    estimatedTotalDop: Math.round(6.35 * TASA_CAMBIO_DOLAR_RD),
    seller: 'Orchestral Direct Store (Top Rated Plus)',
    sellerRating: 4.8,
    deliveryDaysEstimated: 14,
    matchScore: 94,
    matchReasons: ['Excelente precio para nivel iniciación', 'Núcleo de acero duradero', 'Envío estándar con tracking'],
    specs: { tamaño: '4/4', material: 'Aleación Níquel/Acero', nivel: 'Estudiante / Nivel Inicial', juego: 'E-A-D-G' },
    productUrl: 'https://www.aliexpress.com/wholesale?SearchText=Alice+A703+Violin+Strings+4%2F4',
    moq: 1,
    tieredPricing: [
      { minUnits: 1, pricePerUnitUsd: 4.85 },
      { minUnits: 10, pricePerUnitUsd: 3.90 },
      { minUnits: 50, pricePerUnitUsd: 3.20 }
    ],
    resultType: 'SAVED_PRICE',
    inStock: true,
    notes: 'Recomendado por la Cátedra de Cuerdas para dotación de alumnos de nuevo ingreso.'
  },
  {
    id: 'prod-002',
    marketplace: 'amazon',
    marketplaceName: 'Amazon',
    title: 'D\'Addario Prelude Violin String Set, 4/4 Scale, Medium Tension (Solid Steel Core)',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 18.99,
    shippingCostUsd: 0,
    estimatedTotalUsd: 18.99,
    estimatedTotalDop: Math.round(18.99 * TASA_CAMBIO_DOLAR_RD),
    seller: 'D\'Addario Official Store (Amazon Prime)',
    sellerRating: 4.9,
    deliveryDaysEstimated: 4,
    matchScore: 98,
    matchReasons: ['Calidad estándar pedagógica internacional', 'Entrega inmediata vía Miami Courier', 'Resistencia climática alta humedad'],
    specs: { tamaño: '4/4', material: 'Acero Sólido Templado', nivel: 'Intermedio / Orquesta Juvenil', tension: 'Media' },
    productUrl: 'https://www.amazon.com/s?k=DAddario+Prelude+Violin+String+Set+4+4',
    moq: 1,
    resultType: 'LIVE_API',
    inStock: true,
    notes: 'Cuerda institucional oficial para la Orquesta Sinfónica Juvenil.'
  },
  {
    id: 'prod-003',
    marketplace: 'alibaba',
    marketplaceName: 'Alibaba (Wholesale)',
    title: 'Bulk Student Violin Strings 4/4 Wholesale Set (Anti-Rust Coating)',
    imageUrl: 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 2.10,
    shippingCostUsd: 25.00,
    estimatedTotalUsd: 130.00,
    estimatedTotalDop: Math.round(130.00 * TASA_CAMBIO_DOLAR_RD),
    seller: 'Taixing Mingxing Musical Instruments Co., Ltd.',
    sellerRating: 4.7,
    deliveryDaysEstimated: 25,
    matchScore: 89,
    matchReasons: ['Precio unitario insuperable en volumen (50 unidades)', 'Trade Assurance verificado'],
    specs: { tamaño: '4/4', moq_requerido: '50 sets', empaque: 'Individual con desecante' },
    productUrl: 'https://www.alibaba.com/trade/search?SearchText=wholesale+student+violin+strings+4%2F4',
    moq: 50,
    tieredPricing: [
      { minUnits: 50, pricePerUnitUsd: 2.10 },
      { minUnits: 200, pricePerUnitUsd: 1.65 },
      { minUnits: 500, pricePerUnitUsd: 1.35 }
    ],
    resultType: 'SAVED_PRICE',
    inStock: true,
    notes: 'Ideal para la compra anual de banco de cuerdas del Departamento de Lutería.'
  },
  {
    id: 'prod-004',
    marketplace: 'local_do',
    marketplaceName: 'Instrumentos Fernando (Santo Domingo)',
    title: 'Juego de Cuerdas para Violín 4/4 Alice / Pirastro Tonica (Entrega Inmediata)',
    imageUrl: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 12.50, // RD$ 750
    shippingCostUsd: 5.00, // Envío Caribe Tours / Metro Pac RD$ 300
    estimatedTotalUsd: 17.50,
    estimatedTotalDop: 1050,
    seller: 'Instrumentos Fernando S.R.L. (RNC 1-30-88941-2)',
    sellerRating: 4.9,
    deliveryDaysEstimated: 1,
    matchScore: 92,
    matchReasons: ['Despacho en 24 horas a Punta Cana', 'Comprobante Fiscal B01 válido para DGII'],
    specs: { tamaño: '4/4', factura_con_itbis: 'Sí', disponibilidad: 'Inmediata en almacén' },
    productUrl: '#local-quote',
    moq: 1,
    resultType: 'MANUAL_QUOTE',
    inStock: true,
    notes: 'Proveedor local homologado para emergencias antes de conciertos.'
  },

  // 2. Atriles de Música Plegables
  {
    id: 'prod-005',
    marketplace: 'amazon',
    marketplaceName: 'Amazon',
    title: 'Gleam Folding Sheet Music Stand with Carrying Bag & Sheet Music Clip, Heavy Duty',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 19.99,
    shippingCostUsd: 0,
    estimatedTotalUsd: 19.99,
    estimatedTotalDop: Math.round(19.99 * TASA_CAMBIO_DOLAR_RD),
    seller: 'GLEAM Direct Amazon',
    sellerRating: 4.7,
    deliveryDaysEstimated: 5,
    matchScore: 95,
    matchReasons: ['Incluye funda de transporte impermeable', 'Capacidad orquestal hasta 135 cm'],
    specs: { altura_maxima: '135 cm', material: 'Acero tubular negro', peso: '1.2 kg', incluye: 'Funda + Clip' },
    productUrl: 'https://www.amazon.com/s?k=Gleam+Folding+Sheet+Music+Stand',
    moq: 1,
    resultType: 'LIVE_API',
    inStock: true
  },
  {
    id: 'prod-006',
    marketplace: 'alibaba',
    marketplaceName: 'Alibaba (Wholesale)',
    title: 'Heavy Duty Metal Orchestra Folding Music Stand with Reinforced Joint (MOQ 20)',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 7.80,
    shippingCostUsd: 65.00,
    estimatedTotalUsd: 221.00, // Por 20 unidades
    estimatedTotalDop: Math.round(221.00 * TASA_CAMBIO_DOLAR_RD),
    seller: 'Tianjin D&S Musical Instrument Co., Ltd.',
    sellerRating: 4.8,
    deliveryDaysEstimated: 28,
    matchScore: 97,
    matchReasons: ['Excelente para dotar la orquesta completa (20 unidades)', 'Ahorro del 58% vs compra individual'],
    specs: { altura_maxima: '140 cm', calibre_metal: '1.2 mm reforzado', moq: '20 unidades' },
    productUrl: 'https://www.alibaba.com/trade/search?SearchText=folding+music+stand+orchestra+wholesale',
    moq: 20,
    tieredPricing: [
      { minUnits: 20, pricePerUnitUsd: 7.80 },
      { minUnits: 50, pricePerUnitUsd: 6.50 },
      { minUnits: 100, pricePerUnitUsd: 5.40 }
    ],
    resultType: 'SAVED_PRICE',
    inStock: true
  },
  {
    id: 'prod-007',
    marketplace: 'ebay',
    marketplaceName: 'eBay',
    title: 'Manhasset Symphony Stand 4801 Black Concert Orchestra Grade (Heavy Steel)',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 49.95,
    shippingCostUsd: 8.50,
    estimatedTotalUsd: 58.45,
    estimatedTotalDop: Math.round(58.45 * TASA_CAMBIO_DOLAR_RD),
    seller: 'Music123 eBay Superstore (99.4% Positivo)',
    sellerRating: 4.9,
    deliveryDaysEstimated: 6,
    matchScore: 90,
    matchReasons: ['Calidad profesional de sala de conciertos', 'Estructura rígida indeformable'],
    specs: { tipo: 'Atril de Concierto Fijo', marca: 'Manhasset Made in USA', durabilidad: '10+ años' },
    productUrl: 'https://www.ebay.com/sch/i.html?_nkw=Manhasset+Symphony+Stand+4801',
    moq: 1,
    resultType: 'LIVE_API',
    inStock: true
  },

  // 3. Almohadillas / Hombreras de Violín (Shoulder Rests)
  {
    id: 'prod-008',
    marketplace: 'aliexpress',
    marketplaceName: 'AliExpress',
    title: 'Collapsible Foam Violin Shoulder Rest 4/4 - 3/4 Adjustable Rubber Feet',
    imageUrl: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 3.40,
    shippingCostUsd: 1.20,
    estimatedTotalUsd: 4.60,
    estimatedTotalDop: Math.round(4.60 * TASA_CAMBIO_DOLAR_RD),
    seller: 'Global Luthier & Violin Parts Store',
    sellerRating: 4.7,
    deliveryDaysEstimated: 15,
    matchScore: 91,
    matchReasons: ['Pies de goma que no dañan el barniz', 'Ajustable para 3/4 y 4/4'],
    specs: { tamaño: '4/4 y 3/4', material: 'Plástico ABS + Espuma Eva de alta densidad' },
    productUrl: 'https://www.aliexpress.com/wholesale?SearchText=Violin+Shoulder+Rest+4%2F4+Adjustable',
    moq: 1,
    resultType: 'SAVED_PRICE',
    inStock: true
  },
  {
    id: 'prod-009',
    marketplace: 'amazon',
    marketplaceName: 'Amazon',
    title: 'Kun Original Violin Shoulder Rest 4/4 (Ergonomic Canadian Hardwood / Padded)',
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=80',
    unitPriceUsd: 26.50,
    shippingCostUsd: 0,
    estimatedTotalUsd: 26.50,
    estimatedTotalDop: Math.round(26.50 * TASA_CAMBIO_DOLAR_RD),
    seller: 'Kun Official Amazon Store',
    sellerRating: 4.9,
    deliveryDaysEstimated: 4,
    matchScore: 96,
    matchReasons: ['Diseño ergonómico estándar de conservatorio', 'Evita lesiones posturales'],
    specs: { marca: 'Kun Original', origen: 'Canadá', nivel: 'Avanzado / Concierto' },
    productUrl: 'https://www.amazon.com/s?k=Kun+Original+Violin+Shoulder+Rest+4+4',
    moq: 1,
    resultType: 'LIVE_API',
    inStock: true
  }
];

// Helper para parsear URLs pegadas por el usuario
export function parseMarketplaceUrl(rawUrl: string): {
  marketplace: MarketplaceId;
  marketplaceName: string;
  inferredTitle: string;
  isValid: boolean;
} {
  const url = rawUrl.trim().toLowerCase();
  
  if (url.includes('amazon.com') || url.includes('amzn.to')) {
    return {
      marketplace: 'amazon',
      marketplaceName: 'Amazon',
      inferredTitle: extractProductKeywordsFromUrl(rawUrl, 'amazon'),
      isValid: true
    };
  } else if (url.includes('aliexpress.com')) {
    return {
      marketplace: 'aliexpress',
      marketplaceName: 'AliExpress',
      inferredTitle: extractProductKeywordsFromUrl(rawUrl, 'aliexpress'),
      isValid: true
    };
  } else if (url.includes('alibaba.com')) {
    return {
      marketplace: 'alibaba',
      marketplaceName: 'Alibaba',
      inferredTitle: extractProductKeywordsFromUrl(rawUrl, 'alibaba'),
      isValid: true
    };
  } else if (url.includes('ebay.com')) {
    return {
      marketplace: 'ebay',
      marketplaceName: 'eBay',
      inferredTitle: extractProductKeywordsFromUrl(rawUrl, 'ebay'),
      isValid: true
    };
  } else if (url.includes('temu.com')) {
    return {
      marketplace: 'temu',
      marketplaceName: 'Temu',
      inferredTitle: extractProductKeywordsFromUrl(rawUrl, 'temu'),
      isValid: true
    };
  } else if (url.includes('shein.com')) {
    return {
      marketplace: 'shein',
      marketplaceName: 'SHEIN',
      inferredTitle: extractProductKeywordsFromUrl(rawUrl, 'shein'),
      isValid: true
    };
  }

  return {
    marketplace: 'local_do',
    marketplaceName: 'Enlace Web / Suplidor Externo',
    inferredTitle: 'Producto Importado / Suplidor',
    isValid: rawUrl.startsWith('http')
  };
}

function extractProductKeywordsFromUrl(url: string, marketplace: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    
    if (marketplace === 'amazon') {
      const dpIdx = pathParts.indexOf('dp');
      if (dpIdx > 0 && pathParts[dpIdx - 1]) {
        return pathParts[dpIdx - 1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
    }
    
    if (pathParts.length > 0) {
      const last = pathParts[pathParts.length - 1].replace(/\.html|\.htm/g, '');
      return last.replace(/[-_]/g, ' ').slice(0, 60);
    }
  } catch {
    // ignore
  }
  return 'Producto Identificado';
}

// AI Assistant Parser para Requerimientos en Lenguaje Natural
export function parseRequirementWithAI(query: string): {
  product: string;
  category: string;
  quantity: number;
  specs: Record<string, string>;
  targetPriceUsd?: number;
  marketplaces: MarketplaceId[];
  searchKeywords: string;
} {
  const q = query.toLowerCase();
  
  // Extraer cantidad
  let quantity = 1;
  const qtyMatch = q.match(/(\d+)\s*(unidades|sets|juegos|piezas|atriles|arcos|cuerdas|violines|stands|pcs)/i) || q.match(/^(\d+)\s+/);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // Extraer precio objetivo
  let targetPriceUsd: number | undefined;
  const priceMatch = q.match(/(?:máximo|max|menos de|presupuesto de|hasta)\s*(?:usd|\$)?\s*(\d+(?:\.\d+)?)/i) || q.match(/\$(\d+(?:\.\d+)?)/);
  if (priceMatch) {
    targetPriceUsd = parseFloat(priceMatch[1]);
  }

  // Determinar categoría y producto
  let category = 'accesorios';
  let product = 'Accesorio Musical';
  const specs: Record<string, string> = {};

  if (q.includes('cuerda') || q.includes('string')) {
    product = 'Juego de Cuerdas para Violín';
    category = 'instrumentos_repuestos';
    if (q.includes('4/4') || q.includes('completo')) specs['tamaño'] = '4/4';
    if (q.includes('acero') || q.includes('steel')) specs['material'] = 'Núcleo de Acero';
    if (q.includes('estudiante') || q.includes('iniciacion')) specs['nivel'] = 'Estudiante';
  } else if (q.includes('atril') || q.includes('stand') || q.includes('music stand')) {
    product = 'Atril de Música Plegable';
    category = 'mobiliario_orquesta';
    if (q.includes('metal') || q.includes('acero')) specs['material'] = 'Acero / Metal Negro';
    if (q.includes('plegable') || q.includes('folding')) specs['tipo'] = 'Plegable con Funda';
    if (q.includes('120') || q.includes('130') || q.includes('140')) specs['altura'] = '≥ 120 cm';
  } else if (q.includes('hombrera') || q.includes('almohadilla') || q.includes('shoulder rest')) {
    product = 'Almohadilla / Hombrera de Violín';
    category = 'accesorios';
    if (q.includes('4/4')) specs['tamaño'] = '4/4';
    if (q.includes('ajustable')) specs['ajuste'] = 'Regulable en Altura y Ancho';
  } else if (q.includes('arco') || q.includes('bow')) {
    product = 'Arco de Violín';
    category = 'instrumentos_repuestos';
    if (q.includes('fibra') || q.includes('carbon')) specs['material'] = 'Fibra de Carbono';
    if (q.includes('4/4')) specs['tamaño'] = '4/4';
  } else {
    product = query.split(',')[0].slice(0, 40);
  }

  // Recomendar marketplaces
  const marketplaces: MarketplaceId[] = quantity >= 15 
    ? ['alibaba', 'amazon', 'aliexpress', 'local_do'] 
    : ['amazon', 'aliexpress', 'ebay', 'local_do'];

  const searchKeywords = `${product} ${specs['tamaño'] || ''} ${specs['material'] || ''}`.trim();

  return {
    product,
    category,
    quantity,
    specs,
    targetPriceUsd,
    marketplaces,
    searchKeywords
  };
}
