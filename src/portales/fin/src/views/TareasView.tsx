import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DraftOnlyBanner } from '../components/DraftOnlyBanner';
import { 
  CheckSquare, 
  Square, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User, 
  Sparkles,
  CheckCircle2,
  ListTodo,
  PlusCircle,
  X,
  Send,
  MessageSquare,
  History,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
  Search,
  ChevronRight,
  Building2,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { TareaInstitucional } from '../types';

export const TareasView: React.FC = () => {
  const { 
    currentUser,
    tareas, 
    completarTarea, 
    crearTareaInstitucional,
    actualizarEstadoTarea,
    agregarComentarioTarea,
    escalarTareaADireccion,
    generarRutinasAutomaticas
  } = useFinance();

  // Navigation & Category Filter
  const [activeTab, setActiveTab] = useState<'todas' | 'director' | 'hermes' | 'rutina' | 'cobranza' | 'auditoria'>('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada'>('todos');
  const [priorityFilter, setPriorityFilter] = useState<'todas' | 'critica' | 'alta' | 'media' | 'baja'>('todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Task for Detail Drawer / Modal
  const [selectedTask, setSelectedTask] = useState<TareaInstitucional | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [showEscalarModal, setShowEscalarModal] = useState(false);
  const [escalarJustificacion, setEscalarJustificacion] = useState('');

  // New Task Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<'director' | 'hermes' | 'rutina' | 'cobranza' | 'auditoria'>('hermes');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [origen, setOrigen] = useState<'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT'>('FIN');
  const [destino, setDestino] = useState<'DIR' | 'ACM' | 'ADM' | 'FIN' | 'LOG' | 'LUT'>('ADM');
  const [asignadoA, setAsignadoA] = useState('');
  const [fechaLimite, setFechaLimite] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);

  // Notifications / feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Filter logic
  const filteredTasks = tareas.filter(task => {
    // Tab filter
    if (activeTab === 'director') {
      if (task.categoria !== 'director' && task.departamento_destino !== 'DIR' && task.departamento_origen !== 'DIR') return false;
    } else if (activeTab === 'hermes') {
      if (task.categoria !== 'hermes' && task.departamento_destino === 'FIN' && task.departamento_origen === 'FIN') return false;
    } else if (activeTab === 'rutina') {
      if (task.categoria !== 'rutina') return false;
    } else if (activeTab === 'cobranza') {
      if (task.categoria !== 'cobranza') return false;
    } else if (activeTab === 'auditoria') {
      if (task.categoria !== 'auditoria') return false;
    }

    // Status filter
    if (statusFilter !== 'todos' && task.estado !== statusFilter) return false;

    // Priority filter
    if (priorityFilter !== 'todas' && task.prioridad !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        task.titulo.toLowerCase().includes(q) ||
        task.descripcion.toLowerCase().includes(q) ||
        (task.asignado_a && task.asignado_a.toLowerCase().includes(q)) ||
        task.creada_por.toLowerCase().includes(q) ||
        task.departamento_origen.toLowerCase().includes(q) ||
        task.departamento_destino.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Aggregates
  const totalCount = tareas.length;
  const pendientesCount = tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length;
  const criticasCount = tareas.filter(t => (t.prioridad === 'critica' || t.prioridad === 'alta') && t.estado !== 'completada').length;
  const directorCount = tareas.filter(t => (t.categoria === 'director' || t.departamento_destino === 'DIR' || t.departamento_origen === 'DIR') && t.estado !== 'completada').length;
  const hermesCount = tareas.filter(t => (t.categoria === 'hermes' || t.departamento_destino !== t.departamento_origen) && t.estado !== 'completada').length;
  const completadasCount = tareas.filter(t => t.estado === 'completada').length;
  const completionPercentage = Math.round((completadasCount / (totalCount || 1)) * 100);

  // Quick routine handlers
  const handleQuickRoutine = (tipo: 'todas' | 'cierre' | 'mora' | 'backfill' | 'dgii') => {
    const res = generarRutinasAutomaticas(tipo);
    if (res.creadas > 0) {
      showFeedback(`Se han sincronizado ${res.creadas} tarea(s) institucionales.`);
    } else {
      showFeedback('Todas las tareas de rutina para esta categoría ya están activas en el cronograma.', 'info');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return;

    crearTareaInstitucional({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      prioridad,
      departamento_origen: origen,
      departamento_destino: destino,
      asignado_a: asignadoA.trim() || `${destino} Responsable`,
      fecha_limite: fechaLimite,
    });

    showFeedback(`Tarea institucional "${titulo}" registrada exitosamente.`);
    setShowCreateModal(false);
    setTitulo('');
    setDescripcion('');
    setAsignadoA('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    agregarComentarioTarea({
      tarea_id: selectedTask.id,
      texto: newCommentText.trim()
    });

    setNewCommentText('');
    // Refresh selectedTask from state
    const updated = tareas.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
    showFeedback('Comentario y avance registrado en la bitácora institucional.');
  };

  const handleStatusChange = (taskId: string, newStatus: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada') => {
    actualizarEstadoTarea({
      tarea_id: taskId,
      nuevo_estado: newStatus,
      resolucion: newStatus === 'completada' ? (resolutionText || 'Tarea finalizada satisfactoriamente.') : undefined
    });
    setResolutionText('');
    const updated = tareas.find(t => t.id === taskId);
    if (updated) setSelectedTask(updated);
    showFeedback(`Estado de la tarea actualizado a: ${newStatus.toUpperCase()}`);
  };

  const handleEscalarDireccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !escalarJustificacion.trim()) return;

    escalarTareaADireccion({
      tarea_id: selectedTask.id,
      justificacion: escalarJustificacion.trim()
    });

    setShowEscalarModal(false);
    setEscalarJustificacion('');
    const updated = tareas.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
    showFeedback(`Tarea #${selectedTask.id} escalada a Dirección General (DIR) con prioridad crítica.`);
  };

  return (
    <div className="space-y-6">
      <DraftOnlyBanner />

      {/* Header Bento Block */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[11px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Módulo HERMES & Tareas Institucionales
              </span>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[11px] font-mono rounded-full border border-zinc-700/60">
                Canal Inter-Departamental: FIN ⇄ DIR ⇄ ADM ⇄ ACM ⇄ LUT ⇄ LOG
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-3 tracking-tight">
              Tareas del Director & HERMES (Tareas Institucionales)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Gestión unificada de requerimientos de Dirección, acuerdos interdepartamentales HERMES, rutinas de cierre de ventanilla (FIN-P14), alertas de servicios esenciales (48h) y seguimiento a convenios de cobranza (FIN-P13).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleQuickRoutine('todas')}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-2xl text-xs font-semibold transition-all hover:scale-[1.02]"
              title="Escanear y generar rutinas pendientes automáticas"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Sincronizar Rutinas</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Tarea Institucional</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border transition-all ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Bento Metric Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-zinc-800 rounded-xl">
              <ListTodo className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase">Total</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-white">{totalCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Tareas en historial</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-[10px] font-bold font-mono text-rose-400 uppercase">Críticas / Altas</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-rose-400">{criticasCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Atención inmediata</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold font-mono text-amber-400 uppercase">Dirección (DIR)</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-amber-400">{directorCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Requerimientos ejecutivos</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase">HERMES</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-indigo-400">{hermesCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Inter-departamentales</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase">{completionPercentage}% Hecho</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-emerald-400">{completadasCount}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{pendientesCount} pendientes de cierre</p>
          </div>
        </div>

      </div>

      {/* Routine Quick Launch Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-[2rem] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-zinc-200">Disparadores Rápidos de Rutinas:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickRoutine('cierre')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700/80 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>🏦 Cierre de Caja (FIN-P14)</span>
          </button>
          <button
            onClick={() => handleQuickRoutine('mora')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700/80 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>🤝 Cobranza & Mora (FIN-P13)</span>
          </button>
          <button
            onClick={() => handleQuickRoutine('backfill')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700/80 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>📋 Backfill 232 Representantes</span>
          </button>
          <button
            onClick={() => handleQuickRoutine('dgii')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-zinc-700/80 transition-colors font-medium flex items-center gap-1.5"
          >
            <span>🏛️ Formato 606 DGII</span>
          </button>
        </div>
      </div>

      {/* Main Section: Category Tabs & Filters */}
      <div className="space-y-4">
        
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800">
          {[
            { id: 'todas', label: 'Todas las Tareas', count: totalCount },
            { id: 'director', label: 'Tareas del Director (DIR)', count: directorCount },
            { id: 'hermes', label: 'HERMES Inter-Dept', count: hermesCount },
            { id: 'rutina', label: 'Rutinas Operativas FIN', count: tareas.filter(t => t.categoria === 'rutina' && t.estado !== 'completada').length },
            { id: 'cobranza', label: 'Cobranza & Mora (FIN-P13)', count: tareas.filter(t => t.categoria === 'cobranza' && t.estado !== 'completada').length },
            { id: 'auditoria', label: 'Auditoría & Normativa', count: tareas.filter(t => t.categoria === 'auditoria' && t.estado !== 'completada').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === tab.id ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
          
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, departamento, responsable o palabras clave..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="todos">Estado: Todos</option>
              <option value="pendiente">Solo Pendientes</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completadas</option>
              <option value="bloqueada">Bloqueadas</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="todas">Prioridad: Todas</option>
              <option value="critica">Crítica (Urgente)</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

        </div>

      </div>

      {/* Task List Section */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-[2.5rem] space-y-3">
            <ListTodo className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-300">No se encontraron tareas con estos criterios</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Intenta cambiar los filtros seleccionados o sincroniza las rutinas del mes para cargar nuevas tareas operativas.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isDone = task.estado === 'completada';
            const isCritica = task.prioridad === 'critica';
            const isAlta = task.prioridad === 'alta';
            const isDir = task.categoria === 'director' || task.departamento_destino === 'DIR' || task.departamento_origen === 'DIR';
            const commentsCount = task.comentarios?.length || 0;
            const historyCount = task.historial?.length || 0;

            return (
              <div
                key={task.id}
                className={`p-5 rounded-[2rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                  isDone 
                    ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60' 
                    : isCritica
                      ? 'bg-rose-950/20 border-rose-800/50 shadow-lg shadow-rose-950/20 hover:border-rose-700'
                      : isDir
                        ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Left: Check & Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(task.id, isDone ? 'pendiente' : 'completada');
                    }}
                    className={`mt-0.5 w-6 h-6 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                      isDone 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-zinc-600 hover:border-emerald-400 text-transparent hover:text-emerald-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-semibold cursor-pointer hover:text-amber-400 transition-colors ${
                        isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                      }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        {task.titulo}
                      </span>

                      {/* Category Badge */}
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-mono rounded-full border border-zinc-700">
                        {task.categoria ? task.categoria.toUpperCase() : 'HERMES'}
                      </span>

                      {/* Priority Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isCritica 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : isAlta
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {task.prioridad}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        task.estado === 'completada'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : task.estado === 'en_progreso'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : task.estado === 'bloqueada'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60'
                      }`}>
                        {task.estado.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {task.descripcion}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Building2 className="w-3 h-3 text-zinc-400" />
                        {task.departamento_origen} → {task.departamento_destino}
                      </span>
                      <span>·</span>
                      <span>Límite: <strong className="text-zinc-300">{task.fecha_limite}</strong></span>
                      <span>·</span>
                      <span>Resp: {task.asignado_a || task.creada_por}</span>

                      {commentsCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-indigo-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {commentsCount}
                          </span>
                        </>
                      )}

                      {historyCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-zinc-400 flex items-center gap-1">
                            <History className="w-3 h-3" />
                            {historyCount} logs
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-all border border-zinc-700 flex items-center gap-1.5"
                  >
                    <span>Bitácora & Detalle</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                  </button>

                  {!isDone && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'completada')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Detail & Audit Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-950/50">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold uppercase rounded-full border border-amber-500/20">
                    ID: {selectedTask.id}
                  </span>
                  <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold uppercase rounded-full border border-zinc-700">
                    {selectedTask.departamento_origen} → {selectedTask.departamento_destino}
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                    selectedTask.prioridad === 'critica' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    selectedTask.prioridad === 'alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {selectedTask.prioridad}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white mt-2">
                  {selectedTask.titulo}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-300">
              
              {/* Task Description */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Descripción & Requerimiento Institucional
                </span>
                <p className="text-zinc-200 leading-relaxed">
                  {selectedTask.descripcion}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/60 font-mono text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-500 block">Fecha Límite:</span>
                    <strong className="text-zinc-200">{selectedTask.fecha_limite}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Asignado a:</span>
                    <strong className="text-zinc-200">{selectedTask.asignado_a || selectedTask.departamento_destino}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Creada por:</span>
                    <strong className="text-zinc-200">{selectedTask.creada_por}</strong>
                  </div>
                </div>
              </div>

              {/* Status Switcher Toolbar */}
              <div className="p-4 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Estado Actual & Transición
                  </span>
                  {selectedTask.departamento_destino !== 'DIR' && (
                    <button
                      onClick={() => setShowEscalarModal(true)}
                      className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>Escalar a Dirección (DIR)</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['pendiente', 'en_progreso', 'completada', 'bloqueada'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedTask.id, st)}
                      className={`p-2.5 rounded-xl text-center font-semibold font-mono text-[11px] transition-all border ${
                        selectedTask.estado === st
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md font-bold'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {st.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution if completed */}
              {selectedTask.estado === 'completada' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400 block">
                    Resolución / Dictamen de Cierre:
                  </span>
                  <p className="text-xs">
                    {selectedTask.resolucion || 'Tarea finalizada y aprobada en los registros contables/operativos.'}
                  </p>
                  {selectedTask.fecha_completada && (
                    <span className="text-[10px] text-emerald-400/80 font-mono block pt-1">
                      Fecha de Cierre: {selectedTask.fecha_completada}
                    </span>
                  )}
                </div>
              )}

              {/* Comments & Activity Thread */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-300 font-semibold text-xs">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Bitácora de Avances & Comentarios ({selectedTask.comentarios?.length || 0})</span>
                </div>

                <div className="space-y-2.5">
                  {(!selectedTask.comentarios || selectedTask.comentarios.length === 0) ? (
                    <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
                      No hay notas de seguimiento registradas. Puedes añadir la primera nota abajo.
                    </p>
                  ) : (
                    selectedTask.comentarios.map(c => (
                      <div key={c.id} className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-200">{c.autor}</span>
                            <span className="px-2 py-0.2 bg-zinc-800 text-zinc-400 rounded-md font-mono text-[9px]">
                              {c.departamento} ({c.rol})
                            </span>
                          </div>
                          <span className="text-zinc-500 font-mono text-[10px]">{c.fecha}</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {c.texto}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* New Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Escribir avance o nota de seguimiento..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Anotar</span>
                  </button>
                </form>
              </div>

              {/* Immutable Audit Log History */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
                  <History className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Historial Inmutable de Auditoría ({selectedTask.historial?.length || 0} registros)</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedTask.historial?.map(h => (
                    <div key={h.id} className="text-[11px] font-mono text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60 flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-zinc-300">{h.actor}</strong> ({h.departamento}): <span className="text-amber-400/90">{h.accion}</span>
                        {h.valor_anterior && h.valor_nuevo && (
                          <span className="text-zinc-500"> [{h.valor_anterior} → {h.valor_nuevo}]</span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 shrink-0">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Escalar a Dirección Modal */}
      {showEscalarModal && selectedTask && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Building2 className="w-5 h-5" />
                <h3 className="font-semibold text-white text-sm">Escalar Requerimiento a Dirección (DIR)</h3>
              </div>
              <button onClick={() => setShowEscalarModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEscalarDireccion} className="space-y-4 text-xs">
              <p className="text-zinc-400 leading-relaxed">
                Esta acción transferirá la responsabilidad a <strong>Dirección General (DIR)</strong>, marcando la prioridad como <strong>CRÍTICA</strong> y registrando la solicitud en la bitácora ejecutiva.
              </p>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Motivo / Justificación del Escalamiento</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. Requiere aprobación de condonación de cuotas, autorización de presupuesto extraordinario..."
                  value={escalarJustificacion}
                  onChange={e => setEscalarJustificacion(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalarModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/30"
                >
                  Confirmar Escalamiento a DIR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Programar Nueva Tarea Institucional</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Título de la Tarea / Requerimiento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Revisión y autorización de nómina docente quincenal..."
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Descripción / Procedimiento Requerido</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalles sobre entregables, comprobantes fiscales o aprobaciones necesarias..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Categoría</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="hermes">HERMES (Inter-Dept)</option>
                    <option value="director">Tareas del Director (DIR)</option>
                    <option value="rutina">Rutina Operativa FIN</option>
                    <option value="cobranza">Cobranza & Mora (FIN-P13)</option>
                    <option value="auditoria">Auditoría & Normativa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Prioridad Operativa</label>
                  <select
                    value={prioridad}
                    onChange={e => setPrioridad(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica (Urgente)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Dpto. Origen</label>
                  <select
                    value={origen}
                    onChange={e => setOrigen(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="FIN">FIN (Finanzas)</option>
                    <option value="DIR">DIR (Dirección)</option>
                    <option value="ADM">ADM (Admisión/Administración)</option>
                    <option value="ACM">ACM (Académico Musical)</option>
                    <option value="LOG">LOG (Logística)</option>
                    <option value="LUT">LUT (Luthería)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Dpto. Destino</label>
                  <select
                    value={destino}
                    onChange={e => setDestino(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="ADM">ADM (Admisión/Administración)</option>
                    <option value="FIN">FIN (Finanzas)</option>
                    <option value="DIR">DIR (Dirección)</option>
                    <option value="ACM">ACM (Académico Musical)</option>
                    <option value="LOG">LOG (Logística)</option>
                    <option value="LUT">LUT (Luthería)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Responsable Asignado</label>
                  <input
                    type="text"
                    placeholder="Ej. Katherine Sánchez, Manuel Marcano..."
                    value={asignadoA}
                    onChange={e => setAsignadoA(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    required
                    value={fechaLimite}
                    onChange={e => setFechaLimite(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
