import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Layers, 
  FileText, 
  Plus, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  SlidersHorizontal, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Store, 
  RefreshCw, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Star,
  Info,
  CheckCircle2,
  Tag,
  Package,
  Award,
  Edit3,
  History
} from 'lucide-react';
import { 
  MARKETPLACE_CAPABILITIES, 
  INITIAL_PROCUREMENT_CATALOG, 
  getTasaCambioActual, 
  calcularLandedCost, 
  parseMarketplaceUrl, 
  parseRequirementWithAI 
} from '../lib/marketplaceProviders';
import { exchangeRateService, ExchangeRateRecord } from '../lib/exchangeRateProvider';
import { 
  MarketplaceId, 
  NormalizedProductResult, 
  SavedProduct, 
  LocalSupplierQuote, 
  ProcurementRequirement,
  LandedCostEstimate,
  ResultSourceType
} from '../types';

export const TienditaView: React.FC = () => {
  const { 
    currentUser, 
    solicitudesNecesidades, 
    partidas, 
    crearTareaInstitucional 
  } = useFinance();

  // Gestión dinámica de tasa de cambio
  const [currentExchangeRate, setCurrentExchangeRate] = useState<ExchangeRateRecord>(exchangeRateService.getCurrentRate());
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [newRateInput, setNewRateInput] = useState<string>(currentExchangeRate.rate.toString());
  const [rateNotesInput, setRateNotesInput] = useState<string>('');
  const [rateHistoryList, setRateHistoryList] = useState<ExchangeRateRecord[]>(exchangeRateService.getAllHistoricalRates());

  const isUserAuthorizedForRates = currentUser.rol === 'director' || currentUser.rol === 'finanzas';

  const handleUpdateExchangeRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newRateInput);
    if (isNaN(val) || val <= 0) {
      alert('Por favor ingrese un valor de tasa numérico válido mayor a 0.');
      return;
    }

    try {
      const updated = exchangeRateService.updateManualRate(
        val,
        { id: currentUser.id, nombre: currentUser.nombre, rol: currentUser.rol },
        rateNotesInput || 'Actualización manual autorizada en Tiendita'
      );
      setCurrentExchangeRate(updated);
      setRateHistoryList(exchangeRateService.getAllHistoricalRates());
      setShowRateModal(false);
      setRateNotesInput('');
      alert(`Tasa oficial de cambio actualizada exitosamente a RD$ ${val.toFixed(2)} / USD.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Estados principales de la vista
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'comparison' | 'local_quote' | 'budget_link' | 'matrix'>('search');
  
  // Búsqueda y criterios
  const [searchQuery, setSearchQuery] = useState<string>('20 atriles de música plegables, metal negro, min 120cm, max $20 USD');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<MarketplaceId[]>(['amazon', 'aliexpress', 'alibaba', 'ebay', 'local_do']);
  const [searchResults, setSearchResults] = useState<NormalizedProductResult[]>(INITIAL_PROCUREMENT_CATALOG);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(true);
  const [aiStructuredCriteria, setAiStructuredCriteria] = useState<ReturnType<typeof parseRequirementWithAI> | null>(null);

  // Modal / Formulario de URL pegada
  const [pasteUrlInput, setPasteUrlInput] = useState<string>('');
  const [pastedUrlInfo, setPastedUrlInfo] = useState<ReturnType<typeof parseMarketplaceUrl> | null>(null);

  // Lista de Productos Guardados / Wishlist
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([
    {
      id: 'saved-01',
      title: 'D\'Addario Prelude Violin String Set 4/4 Solid Steel Core',
      category: 'Cuerdas / Insumos de Lutería',
      marketplace: 'amazon',
      marketplaceName: 'Amazon',
      productUrl: 'https://www.amazon.com/s?k=DAddario+Prelude+Violin+String+Set+4+4',
      imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&auto=format&fit=crop&q=80',
      currentPriceUsd: 18.99,
      currency: 'USD',
      shippingCostUsd: 0,
      estimatedTotalUsd: 18.99,
      seller: 'D\'Addario Direct',
      specs: { tamaño: '4/4', material: 'Acero Sólido', tension: 'Media' },
      quantity: 15,
      moq: 1,
      dateChecked: '2026-08-22',
      firstObservedPriceUsd: 19.50,
      lowestObservedPriceUsd: 17.80,
      highestObservedPriceUsd: 21.00,
      priceHistory: [
        { date: '2026-06-15', priceUsd: 21.00, source: 'Amazon Check' },
        { date: '2026-07-20', priceUsd: 17.80, source: 'Amazon Prime Day' },
        { date: '2026-08-22', priceUsd: 18.99, source: 'Check Actual' }
      ],
      targetPriceAlertUsd: 17.50,
      status: 'seleccionado',
      lifecycleStatus: 'budget_review',
      linkedSolicitudId: 'sol-001',
      notes: 'Solicitud aprobada por Coordinación Académica para el ciclo escolar 2026-2027.'
    },
    {
      id: 'saved-02',
      title: 'Heavy Duty Metal Orchestra Folding Music Stand with Reinforced Joint',
      category: 'Mobiliario Orquesta',
      marketplace: 'alibaba',
      marketplaceName: 'Alibaba',
      productUrl: 'https://www.alibaba.com/trade/search?SearchText=folding+music+stand+orchestra+wholesale',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
      currentPriceUsd: 7.80,
      currency: 'USD',
      shippingCostUsd: 65.00,
      estimatedTotalUsd: 221.00,
      seller: 'Tianjin D&S Musical Co.',
      specs: { altura: '140 cm', calibre: '1.2mm reforzado', moq: '20 pcs' },
      quantity: 20,
      moq: 20,
      dateChecked: '2026-08-22',
      firstObservedPriceUsd: 8.50,
      lowestObservedPriceUsd: 7.80,
      highestObservedPriceUsd: 8.50,
      priceHistory: [
        { date: '2026-07-10', priceUsd: 8.50, source: 'Cotización Inicial' },
        { date: '2026-08-22', priceUsd: 7.80, source: 'Descuento por volumen 20+' }
      ],
      targetPriceAlertUsd: 7.50,
      status: 'en_evaluacion',
      lifecycleStatus: 'researching',
      linkedSolicitudId: 'sol-002',
      notes: 'Evaluando costo total con flete marítimo consolidado.'
    }
  ]);

  // Cotizaciones de Suplidores Locales RD
  const [localQuotes, setLocalQuotes] = useState<LocalSupplierQuote[]>([
    {
      id: 'loc-01',
      supplierName: 'Instrumentos Fernando S.R.L.',
      rnc: '1-30-88941-2',
      contactPhone: '809-567-3321',
      contactEmail: 'ventas@instrumentosfernando.com.do',
      itemDescription: '20 Atriles Plegables Orquestales de Acero Reforzado con Funda',
      quantity: 20,
      unitPriceDop: 1250,
      itbisDop: 4500,
      deliveryCostDop: 800,
      totalDop: 30300,
      totalUsdEquivalent: 500.82,
      quotationNumber: 'COT-2026-894',
      validityDate: '2026-09-15',
      deliveryDays: 2,
      notes: 'Despacho directo a Bávaro vía Metro Pac. Comprobante B01 con crédito fiscal.',
      linkedSolicitudId: 'sol-002'
    }
  ]);

  // Formulario de nueva cotización local
  const [newLocalQuote, setNewLocalQuote] = useState({
    supplierName: '',
    rnc: '',
    phone: '',
    email: '',
    item: '',
    quantity: 1,
    unitPriceDop: 0,
    itbisDop: 0,
    deliveryDop: 0,
    quotationNumber: '',
    validityDate: '2026-09-30',
    deliveryDays: 2,
    linkedSolicitudId: solicitudesNecesidades[0]?.id || ''
  });

  // Calculadora de Landed Cost
  const [selectedProductForCost, setSelectedProductForCost] = useState<NormalizedProductResult | null>(null);
  const [customQty, setCustomQty] = useState<number>(20);
  const [customShippingUsd, setCustomShippingUsd] = useState<number>(35);
  const [customWeightLbs, setCustomWeightLbs] = useState<number>(25);

  // Vincular a Solicitud de Compra
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<string>(solicitudesNecesidades[0]?.id || '');
  const selectedSolicitud = solicitudesNecesidades.find(s => s.id === selectedSolicitudId) || solicitudesNecesidades[0];

  // Partida presupuestaria vinculada a la solicitud
  const matchedPartida = useMemo(() => {
    return partidas.find(p => p.centro_costo === (selectedSolicitud?.area || 'ACM')) || partidas[0];
  }, [partidas, selectedSolicitud]);

  // Manejador de búsqueda natural asistida por AI
  const handleExecuteSearch = (queryText: string) => {
    setIsSearching(true);
    const structured = parseRequirementWithAI(queryText);
    setAiStructuredCriteria(structured);

    setTimeout(() => {
      // Filtrar resultados o generar variantes de catálogo
      let filtered = INITIAL_PROCUREMENT_CATALOG.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(structured.product.toLowerCase()) ||
          Object.values(item.specs).some(v => v.toLowerCase().includes(queryText.toLowerCase().slice(0, 5))) ||
          queryText.toLowerCase().split(' ').some(w => w.length > 3 && item.title.toLowerCase().includes(w));
        return matchesQuery;
      });

      if (filtered.length === 0) {
        filtered = INITIAL_PROCUREMENT_CATALOG;
      }

      setSearchResults(filtered);
      setIsSearching(false);
    }, 450);
  };

  // Agregar producto a Wishlist
  const handleSaveToWishlist = (item: NormalizedProductResult) => {
    const exists = savedProducts.some(p => p.title === item.title && p.marketplace === item.marketplace);
    if (exists) {
      alert('Este producto ya se encuentra registrado en tu lista de seguimiento.');
      return;
    }

    const newSaved: SavedProduct = {
      id: `saved-${Date.now()}`,
      title: item.title,
      category: 'Insumo Institucional',
      marketplace: item.marketplace,
      marketplaceName: item.marketplaceName,
      productUrl: item.productUrl,
      imageUrl: item.imageUrl,
      currentPriceUsd: item.unitPriceUsd,
      currency: 'USD',
      shippingCostUsd: item.shippingCostUsd,
      estimatedTotalUsd: item.estimatedTotalUsd,
      seller: item.seller,
      specs: item.specs,
      quantity: item.moq || 1,
      moq: item.moq || 1,
      dateChecked: new Date().toISOString().split('T')[0],
      firstObservedPriceUsd: item.unitPriceUsd,
      lowestObservedPriceUsd: item.unitPriceUsd,
      highestObservedPriceUsd: item.unitPriceUsd,
      priceHistory: [{ date: new Date().toISOString().split('T')[0], priceUsd: item.unitPriceUsd, source: 'Captura Tiendita' }],
      status: 'guardado',
      lifecycleStatus: 'researching',
      linkedSolicitudId: selectedSolicitudId
    };

    setSavedProducts([newSaved, ...savedProducts]);
    alert(`"${item.title.slice(0, 40)}..." guardado en la lista de compras institucionales.`);
  };

  // Crear tarea en HERMES cuando un precio objetivo se alcanza
  const handleCreatePriceAlertTask = (product: SavedProduct, targetPrice: number) => {
    crearTareaInstitucional({
      titulo: `Alerta de Precio Tiendita: ${product.title.slice(0, 45)}`,
      descripcion: `El producto ${product.title} en ${product.marketplaceName} ha alcanzado el objetivo de $${targetPrice} USD (Actual: $${product.currentPriceUsd} USD). Proceder con revisión presupuestaria.`,
      prioridad: 'alta',
      departamento_origen: 'LOG',
      departamento_destino: 'FIN',
      fecha_limite: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      categoria: 'hermes',
      vinculo_entidad_tipo: 'solicitud_necesidad',
      vinculo_entidad_id: product.linkedSolicitudId
    });
    alert(`Alerta y Tarea HERMES programada para aviso cuando el precio sea menor o igual a $${targetPrice} USD.`);
  };

  // Registrar Cotización Local
  const handleSaveLocalQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocalQuote.supplierName || !newLocalQuote.item) {
      alert('Por favor complete los campos obligatorios del suplidor.');
      return;
    }

    const totalDop = (newLocalQuote.unitPriceDop * newLocalQuote.quantity) + Number(newLocalQuote.itbisDop) + Number(newLocalQuote.deliveryDop);
    const quote: LocalSupplierQuote = {
      id: `loc-${Date.now()}`,
      supplierName: newLocalQuote.supplierName,
      rnc: newLocalQuote.rnc || '1-01-00000-0',
      contactPhone: newLocalQuote.phone,
      contactEmail: newLocalQuote.email,
      itemDescription: newLocalQuote.item,
      quantity: Number(newLocalQuote.quantity),
      unitPriceDop: Number(newLocalQuote.unitPriceDop),
      itbisDop: Number(newLocalQuote.itbisDop),
      deliveryCostDop: Number(newLocalQuote.deliveryDop),
      totalDop,
      totalUsdEquivalent: Number((totalDop / getTasaCambioActual()).toFixed(2)),
      quotationNumber: newLocalQuote.quotationNumber || `COT-${Date.now().toString().slice(-4)}`,
      validityDate: newLocalQuote.validityDate,
      deliveryDays: Number(newLocalQuote.deliveryDays),
      linkedSolicitudId: newLocalQuote.linkedSolicitudId
    };

    setLocalQuotes([quote, ...localQuotes]);
    alert('Cotización de proveedor local registrada exitosamente.');
    setNewLocalQuote({
      supplierName: '',
      rnc: '',
      phone: '',
      email: '',
      item: '',
      quantity: 1,
      unitPriceDop: 0,
      itbisDop: 0,
      deliveryDop: 0,
      quotationNumber: '',
      validityDate: '2026-09-30',
      deliveryDays: 2,
      linkedSolicitudId: solicitudesNecesidades[0]?.id || ''
    });
  };

  // Cálculo de Landed Cost reactivo
  const landedCostEstimate: LandedCostEstimate = useMemo(() => {
    if (!selectedProductForCost) {
      return calcularLandedCost({
        precioUnitarioUsd: 19.99,
        cantidad: customQty,
        costoEnvioUsd: customShippingUsd,
        pesoLibrasEstimado: customWeightLbs
      });
    }
    return calcularLandedCost({
      precioUnitarioUsd: selectedProductForCost.unitPriceUsd,
      cantidad: customQty,
      costoEnvioUsd: customShippingUsd,
      pesoLibrasEstimado: customWeightLbs
    });
  }, [selectedProductForCost, customQty, customShippingUsd, customWeightLbs]);

  // Helper de badges por tipo de fuente
  const renderSourceBadge = (type: ResultSourceType) => {
    switch (type) {
      case 'LIVE_API':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE API RESULT
          </span>
        );
      case 'SAVED_PRICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 border border-sky-500/30 text-sky-400">
            SAVED PRICE
          </span>
        );
      case 'MANUAL_QUOTE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            COTIZACIÓN LOCAL RD
          </span>
        );
      case 'EXTERNAL_SEARCH':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">
            ENLACE EXTERNO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Institucional de Tiendita */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Tiendita — Procurement Intelligence Store
                  <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                    FIN-PRC-01
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Espacio institucional de inteligencia de compras, abastecimiento internacional, comparación de suplidores y control presupuestario.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setNewRateInput(currentExchangeRate.rate.toString());
                setShowRateModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 text-xs text-left transition group"
              title="Clic para ver histórico o actualizar tasa oficial de cambio"
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block flex items-center gap-1">
                    Tasa Oficial ({currentExchangeRate.effectiveDate})
                    <Edit3 className="w-2.5 h-2.5 text-zinc-500 group-hover:text-emerald-400" />
                  </span>
                  <span className="font-mono font-bold text-emerald-400">RD$ {currentExchangeRate.rate.toFixed(2)} / USD</span>
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-zinc-700"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Matriz de APIs de Marketplaces
            </button>
          </div>
        </div>

        {/* Quick Links Marketplace Launcher */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            Acceso Rápido a Plataformas Oficiales (Apertura Segura en Nueva Pestaña)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {MARKETPLACE_CAPABILITIES.map(mp => (
              <a
                key={mp.marketplace}
                href={mp.marketplace === 'local_do' ? '#local' : `${mp.directSearchUrlPattern}${encodeURIComponent('violin 4/4')}`}
                target={mp.marketplace === 'local_do' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                onClick={e => {
                  if (mp.marketplace === 'local_do') {
                    e.preventDefault();
                    setActiveTab('local_quote');
                  }
                }}
                className="p-2.5 bg-zinc-900/70 hover:bg-zinc-900 rounded-xl border border-zinc-800/80 hover:border-indigo-500/50 transition group flex flex-col justify-between text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 transition">
                    {mp.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 truncate">
                  {mp.suitableForFin}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'search' 
              ? 'border-indigo-500 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Search className="w-4 h-4" />
          Búsqueda & Comparación Inteligente
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'saved' 
              ? 'border-indigo-500 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Productos Guardados / Wishlist
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
            {savedProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('local_quote')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'local_quote' 
              ? 'border-indigo-500 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Cotizaciones Suplidores Locales RD
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
            {localQuotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('budget_link')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'budget_link' 
              ? 'border-indigo-500 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Conexión Presupuestaria & Solicitudes
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'matrix' 
              ? 'border-indigo-500 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Matriz de Capacidades de APIs
        </button>
      </div>

      {/* TAB 1: BÚSQUEDA & COMPARADOR INTELIGENTE */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Natural Language Search Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Asistente de Búsqueda de Requerimientos en Lenguaje Natural
              </label>
              <button
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {showAiAssistant ? 'Ocultar Criterios Técnicos' : 'Mostrar Criterios Estructurados'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleExecuteSearch(searchQuery)}
                  placeholder="Ej: 20 atriles de música plegables metal negro altura min 120cm max $20 USD..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <button
                onClick={() => handleExecuteSearch(searchQuery)}
                disabled={isSearching}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 shrink-0"
              >
                <Search className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                {isSearching ? 'Buscando...' : 'Buscar en Marketplaces'}
              </button>
            </div>

            {/* Structured Criteria Breakdown Card */}
            {showAiAssistant && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Criterios Estructurados por IA (Parser Pedagógico FIN)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Status: Auto-Estructurado</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Producto Detectado</span>
                    <span className="text-zinc-200 font-bold">{aiStructuredCriteria?.product || 'Atril de Música Plegable'}</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Cantidad Solicitada</span>
                    <span className="text-zinc-200 font-mono font-bold">{aiStructuredCriteria?.quantity || 20} Unidades</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Presupuesto Máx / Unidad</span>
                    <span className="text-emerald-400 font-mono font-bold">${aiStructuredCriteria?.targetPriceUsd || 20.00} USD</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Especificaciones Clave</span>
                    <span className="text-indigo-300 font-medium truncate block">Metal negro, plegable, ≥120cm</span>
                  </div>
                </div>

                {/* AI Recommendation Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Dictamen IA:</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Mejor Opción al Mayor (Alibaba MOQ 20 @ $7.80/u)
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Entrega Inmediata (Suplidor Local RD @ $20.66/u)
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Mayor Durabilidad (Amazon Gleam Heavy Duty)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Paste Product URL Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 shrink-0">
              <Tag className="w-4 h-4 text-indigo-400" />
              Pegar Enlace Directo (URL):
            </div>
            <input
              type="text"
              value={pasteUrlInput}
              onChange={e => {
                setPasteUrlInput(e.target.value);
                setPastedUrlInfo(parseMarketplaceUrl(e.target.value));
              }}
              placeholder="Pegar URL de Amazon, AliExpress, Alibaba, eBay, etc..."
              className="flex-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {pastedUrlInfo?.isValid && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                Detectado: {pastedUrlInfo.marketplaceName}
              </span>
            )}
            <button
              onClick={() => {
                if (!pasteUrlInput) return;
                alert(`URL procesada para ${pastedUrlInfo?.marketplaceName}. Abriendo opciones de guardado.`);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              Capturar Producto
            </button>
          </div>

          {/* Search Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                Resultados Normalizados & Comparativa Multicanal ({searchResults.length})
              </h3>
              <div className="text-xs text-zinc-400">
                Ordenado por: <span className="text-zinc-200 font-bold">Match Score Institucional</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(item => (
                <div 
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-800">
                          {item.marketplaceName}
                        </span>
                        {renderSourceBadge(item.resultType)}
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        <Star className="w-3.5 h-3.5 fill-emerald-400" />
                        {item.matchScore}% Match
                      </div>
                    </div>

                    {/* Title & Image */}
                    <div className="flex gap-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-20 h-20 rounded-xl object-cover border border-zinc-800 shrink-0 bg-zinc-900"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-100 leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                          <span>Vendedor: <strong className="text-zinc-300">{item.seller}</strong></span>
                          <span>★ {item.sellerRating}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-zinc-400" />
                          Entrega estimada: ~{item.deliveryDaysEstimated} días
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Cost Breakdown */}
                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Precio Unitario</span>
                        <span className="text-xs font-mono font-bold text-zinc-200">${item.unitPriceUsd.toFixed(2)} USD</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Envío Estimado</span>
                        <span className="text-xs font-mono text-zinc-400">${item.shippingCostUsd.toFixed(2)} USD</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total DOP Aprox</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">RD$ {item.estimatedTotalDop.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Tiered / MOQ wholesale indicator */}
                    {item.tieredPricing && item.tieredPricing.length > 0 && (
                      <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" /> Precios Escalonados por Volumen (MOQ):
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                          {item.tieredPricing.map((t, idx) => (
                            <span key={idx} className="bg-indigo-900/40 px-2 py-0.5 rounded border border-indigo-700/50">
                              {t.minUnits}+ unids: <strong>${t.pricePerUnitUsd.toFixed(2)}/u</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Match Reasons */}
                    <div className="text-[11px] text-zinc-400 space-y-1">
                      {item.matchReasons.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-zinc-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedProductForCost(item);
                        setCustomQty(item.moq || 20);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Calcular Landed Cost
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveToWishlist(item)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 text-[11px] font-bold flex items-center gap-1.5 transition"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Guardar
                      </button>

                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition"
                      >
                        <span>Ver en {item.marketplaceName}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Landed Cost Calculator Drawer / Panel */}
          {selectedProductForCost && (
            <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Calculadora de Costo de Adquisición Total (Landed Cost RD)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Producto: <strong className="text-zinc-200">{selectedProductForCost.title}</strong> ({selectedProductForCost.marketplaceName})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProductForCost(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 font-mono"
                >
                  Cerrar Calculadora ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Cantidad Requerida</label>
                  <input
                    type="number"
                    min={1}
                    value={customQty}
                    onChange={e => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Flete Internacional (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={customShippingUsd}
                    onChange={e => setCustomShippingUsd(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Peso Estimado (Libras Courier)</label>
                  <input
                    type="number"
                    min={1}
                    value={customWeightLbs}
                    onChange={e => setCustomWeightLbs(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Subtotal Mercancía</span>
                  <span className="text-xs font-mono text-zinc-200">${landedCostEstimate.subtotalUsd.toFixed(2)} USD</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Courier Miami-RD</span>
                  <span className="text-xs font-mono text-zinc-300">${landedCostEstimate.localHandlingUsd.toFixed(2)} USD</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Estimado USD</span>
                  <span className="text-sm font-mono font-bold text-zinc-100">${landedCostEstimate.totalLandedUsd.toFixed(2)} USD</span>
                </div>
                <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Total Estimado DOP</span>
                  <span className="text-sm font-mono font-bold text-emerald-300">RD$ {landedCostEstimate.totalLandedDop.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTOS GUARDADOS & HISTORIAL DE PRECIOS */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              Lista Institucional de Compras & Historial de Precios
            </h3>
            <span className="text-xs text-zinc-400">{savedProducts.length} productos en seguimiento</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {savedProducts.map(product => (
              <div 
                key={product.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition shadow-xl"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-20 h-20 rounded-xl object-cover border border-zinc-800 bg-zinc-900 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">{product.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-400 font-bold">
                          {product.marketplaceName}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Categoría: <span className="text-zinc-300">{product.category}</span> • Cantidad: <strong className="text-white font-mono">{product.quantity} unids</strong>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Última verificación: {product.dateChecked} • Proveedor: {product.seller}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 text-right">
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      ${product.currentPriceUsd.toFixed(2)} USD / unid
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      Total: RD$ {(product.currentPriceUsd * product.quantity * getTasaCambioActual()).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Price History Timeline */}
                <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      Histórico de Precios Capturados
                    </span>
                    <span className="font-mono text-zinc-400">
                      Min: ${product.lowestObservedPriceUsd.toFixed(2)} | Max: ${product.highestObservedPriceUsd.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    {product.priceHistory.map((point, idx) => (
                      <div key={idx} className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono">
                        <span className="text-zinc-500 block text-[9px]">{point.date}</span>
                        <span className="text-zinc-200 font-bold">${point.priceUsd.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Alert & HERMES Task trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>Precio Objetivo para Alerta:</span>
                    <strong className="text-emerald-400 font-mono">${product.targetPriceAlertUsd || 15.00} USD</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreatePriceAlertTask(product, product.targetPriceAlertUsd || 15.00)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold transition border border-zinc-700 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Generar Alerta HERMES
                    </button>

                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Abrir Listado Oficial</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COTIZACIONES DE SUPLIDORES LOCALES RD */}
      {activeTab === 'local_quote' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Entrada de Cotización Local */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Registrar Cotización de Suplidor Local (RD)
            </h3>
            <p className="text-xs text-zinc-400">
              Permite comparar ofertas locales de Santo Domingo / Higüey / Bávaro directamente contra opciones de importación (Amazon / AliExpress).
            </p>

            <form onSubmit={handleSaveLocalQuote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Nombre del Suplidor *</label>
                <input
                  type="text"
                  required
                  value={newLocalQuote.supplierName}
                  onChange={e => setNewLocalQuote({ ...newLocalQuote, supplierName: e.target.value })}
                  placeholder="Ej: Instrumentos Fernando, Casa Nelson..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">RNC Suplidor</label>
                  <input
                    type="text"
                    value={newLocalQuote.rnc}
                    onChange={e => setNewLocalQuote({ ...newLocalQuote, rnc: e.target.value })}
                    placeholder="1-30-XXXXX-X"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">No. Cotización</label>
                  <input
                    type="text"
                    value={newLocalQuote.quotationNumber}
                    onChange={e => setNewLocalQuote({ ...newLocalQuote, quotationNumber: e.target.value })}
                    placeholder="COT-2026-001"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Descripción del Ítem *</label>
                <input
                  type="text"
                  required
                  value={newLocalQuote.item}
                  onChange={e => setNewLocalQuote({ ...newLocalQuote, item: e.target.value })}
                  placeholder="Ej: 20 Atriles orquestales reforzados..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={newLocalQuote.quantity}
                    onChange={e => setNewLocalQuote({ ...newLocalQuote, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Precio Unit DOP</label>
                  <input
                    type="number"
                    min={0}
                    value={newLocalQuote.unitPriceDop}
                    onChange={e => setNewLocalQuote({ ...newLocalQuote, unitPriceDop: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">ITBIS (18%)</label>
                  <input
                    type="number"
                    min={0}
                    value={newLocalQuote.itbisDop}
                    onChange={e => setNewLocalQuote({ ...newLocalQuote, itbisDop: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Cotización Local
                </button>
              </div>
            </form>
          </div>

          {/* Listado de Cotizaciones Locales Registradas */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Cotizaciones Locales Disponibles ({localQuotes.length})
            </h3>

            <div className="space-y-3">
              {localQuotes.map(quote => (
                <div 
                  key={quote.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3 hover:border-zinc-700 transition shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {quote.supplierName}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-400">
                          RNC: {quote.rnc}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 mt-0.5">{quote.itemDescription}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-amber-400">
                        RD$ {quote.totalDop.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        ~${quote.totalUsdEquivalent.toFixed(2)} USD
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Cantidad</span>
                      <span className="text-zinc-200 font-mono">{quote.quantity} unids</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Precio Unitario</span>
                      <span className="text-zinc-200 font-mono">RD$ {quote.unitPriceDop.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Entrega</span>
                      <span className="text-emerald-400 font-bold">{quote.deliveryDays} días (Inmediata)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Vigencia</span>
                      <span className="text-zinc-300 font-mono">{quote.validityDate}</span>
                    </div>
                  </div>

                  {quote.notes && (
                    <div className="text-[11px] text-zinc-400 italic">
                      Nota: {quote.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONEXIÓN PRESUPUESTARIA & SOLICITUDES DE NECESIDAD */}
      {activeTab === 'budget_link' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Impacto Presupuestario en Tiempo Real de Compras Suministradas
            </h3>
            <p className="text-xs text-zinc-400">
              Vincule ofertas seleccionadas en Tiendita directamente con las solicitudes de compras institucionales (<code>solicitudes_necesidades</code>).
            </p>

            {/* Solicitud Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Seleccionar Requisición Institucional
                </label>
                <select
                  value={selectedSolicitudId}
                  onChange={e => setSelectedSolicitudId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  {solicitudesNecesidades.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.titulo} — {s.area} (Cantidad: {s.cantidad})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Partida Presupuestaria Afectada
                </label>
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-700 text-xs font-mono text-zinc-200">
                  {matchedPartida?.codigo_partida} — {matchedPartida?.nombre}
                </div>
              </div>
            </div>

            {/* Budget Health Impact Card */}
            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Presupuesto Disponible Actual</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  RD$ {((matchedPartida?.disponible_centavos || 25000000) / 100).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Costo Estimado de Compra</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  RD$ {((selectedSolicitud?.costo_estimado_centavos || 3500000) / 100).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Fondos Comprometidos</span>
                <span className="text-sm font-mono font-bold text-indigo-400">
                  RD$ {((matchedPartida?.comprometido_centavos || 4500000) / 100).toLocaleString()}
                </span>
              </div>
              <div className="bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/30">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">Presupuesto Proyectado Remanente</span>
                <span className="text-sm font-mono font-bold text-white">
                  RD$ {(((matchedPartida?.disponible_centavos || 25000000) - (selectedSolicitud?.costo_estimado_centavos || 3500000)) / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MATRIZ DE CAPACIDADES DE MARKETPLACES */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-sm font-bold text-white">Matriz Oficial de Integración de Marketplaces para SOI Finanzas</h3>
            <p className="text-xs text-zinc-400">
              Evaluación técnica de APIs oficiales, métodos de autenticación y comportamiento de fallback.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 uppercase font-mono text-[10px]">
                    <th className="p-3.5">Marketplace</th>
                    <th className="p-3.5">Search API Oficial</th>
                    <th className="p-3.5">Price & Availability API</th>
                    <th className="p-3.5">Autenticación Requerida</th>
                    <th className="p-3.5">Idoneidad FIN</th>
                    <th className="p-3.5">Fallback Implementado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {MARKETPLACE_CAPABILITIES.map(mp => (
                    <tr key={mp.marketplace} className="hover:bg-zinc-900/40 transition">
                      <td className="p-3.5 font-bold text-zinc-100">{mp.name}</td>
                      <td className="p-3.5 text-zinc-300 font-mono text-[11px]">{mp.officialSearchApi}</td>
                      <td className="p-3.5 text-zinc-300">{mp.priceApi}</td>
                      <td className="p-3.5 text-zinc-400 text-[11px] font-mono">{mp.authRequired}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mp.suitableForFin === 'Alta' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : mp.suitableForFin === 'Media'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {mp.suitableForFin}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-400 text-[11px]">{mp.fallbackBehavior}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión y Actualización de Tasa Oficial de Cambio */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tasa Institucional de Cambio (DOP / USD)</h3>
                  <p className="text-xs text-zinc-400">Control oficial de paridad para compras e importaciones</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRateModal(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                ✕
              </button>
            </div>

            {/* Formulario de actualización para autorizados */}
            {isUserAuthorizedForRates ? (
              <form onSubmit={handleUpdateExchangeRate} className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    Actualizar Tasa Vigente
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Autorizado: {currentUser.nombre} ({currentUser.rol})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 font-medium block mb-1">Nueva Tasa (DOP por 1 USD)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={newRateInput}
                      onChange={e => setNewRateInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="60.50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 font-medium block mb-1">Motivo / Referencia</label>
                    <input 
                      type="text"
                      value={rateNotesInput}
                      onChange={e => setRateNotesInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="Ej: Aprobada Banco Central / Directiva"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    Guardar Tasa Oficial
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
                Solo usuarios con rol de Dirección o Finanzas pueden modificar la tasa oficial.
              </div>
            )}

            {/* Histórico de Tasas */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                Historial Institucional de Paridad Cambiaria
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl bg-zinc-900/40">
                {rateHistoryList.map(rec => (
                  <div key={rec.id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">RD$ {rec.rate.toFixed(2)}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">({rec.effectiveDate})</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {rec.source}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{rec.notes}</p>
                    </div>
                    <div className="text-right text-[10px] text-zinc-500">
                      {rec.enteredBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
