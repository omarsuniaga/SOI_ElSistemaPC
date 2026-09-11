import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { academicDataAdapter } from './dataAdapter';
import { filterStudents, needsAssignment, resolveRoute } from './domain';
import type { AcademicSnapshot, Alumno, Clase, Filter } from './domain';
import s from './App.module.css';

function App() {
  const [location, setLocation] = useState(() => window.location.pathname + window.location.search);
  const [data, setData] = useState<AcademicSnapshot | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const currentUrl = new URL(location, window.location.origin);
  const route = resolveRoute(currentUrl.pathname);
  const requestedFilter = currentUrl.searchParams.get('filter');
  const filter: Filter = requestedFilter === 'unassigned' || requestedFilter === 'absence' || requestedFilter === 'contact' ? requestedFilter : 'all';
  useEffect(() => {
    const pop = () => setLocation(window.location.pathname + window.location.search);
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    let active = true;
    setError(false);
    academicDataAdapter.load().then(value => { if (active) setData(value); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => {
    setMenuOpen(false);
    heading.current?.focus();
    document.title = `${route.page === 'students' || route.page === 'student' ? 'Alumnos' : route.page === 'classes' || route.page === 'class' ? 'Clases' : 'Académico'} · SOI 2.0 Demo`;
  }, [location]);
  function navigate(href: string) {
    history.pushState(null, '', href);
    setLocation(window.location.pathname + window.location.search);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function Link({ href, children, className, current }: { href: string; children: React.ReactNode; className?: string; current?: boolean }) {
    return <a href={href} className={className} aria-current={current ? 'page' : undefined} onClick={event => {
      if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); navigate(href); }
    }}>{children}</a>;
  }
  const active = data?.students.filter(student => student.status === 'activo') ?? [];
  const unassigned = active.filter(needsAssignment);
  const absence = active.filter(student => student.absences >= 2);
  const contact = active.filter(student => !student.contactVerified);
  const selectedStudent = route.page === 'student' ? data?.students.find(student => student.id === route.id) : undefined;
  const selectedClass = route.page === 'class' ? data?.classes.find(clase => clase.id === route.id) : undefined;
  const missing = route.page === 'notFound' || (data && ((route.page === 'student' && !selectedStudent) || (route.page === 'class' && !selectedClass)));
  const title = missing ? 'Página no disponible' : selectedStudent?.name ?? selectedClass?.name ?? (route.page === 'students' ? 'Alumnos' : route.page === 'classes' ? 'Clases y horarios' : 'Pendientes académicos');
  function StudentTable({ students }: { students: Alumno[] }) {
    return students.length ? <div className={s.tableWrap}><table><caption className={s.srOnly}>Alumnos de demostración</caption><thead><tr><th>Alumno</th><th>Cátedra</th><th>Clase</th><th>Seguimiento</th><th><span className={s.srOnly}>Ficha</span></th></tr></thead><tbody>{students.map(student => <tr key={student.id}>
      <td><Link href={`/alumnos/${student.id}`} className={s.studentLink}>{student.name}</Link><small>{student.level} · {student.status === 'activo' ? 'Activo' : 'Inactivo'}</small></td>
      <td>{student.instrument}</td><td>{student.classId ? data?.classes.find(clase => clase.id === student.classId)?.name : 'Sin clase'}</td>
      <td><span className={student.status !== 'activo' ? s.badge : needsAssignment(student) || student.absences >= 2 ? s.warning : s.badge}>{student.status !== 'activo' ? 'Inactivo' : needsAssignment(student) ? 'Asignación pendiente' : student.absences >= 2 ? `${student.absences} ausencias de ejemplo` : !student.contactVerified ? 'Revisar contacto' : 'Sin pendientes de ejemplo'}</span></td>
      <td><Link href={`/alumnos/${student.id}`}>Ver ficha<span className={s.srOnly}> de {student.name}</span></Link></td>
    </tr>)}</tbody></table></div> : <div className={s.empty}><h2>No hay alumnos en esta selección</h2><p>Prueba otro nombre o cambia el filtro.</p><button onClick={() => { setQuery(''); navigate('/administrativo'); }}>Ver todos los alumnos</button></div>;
  }
  function ClassCards({ classes }: { classes: Clase[] }) {
    return <div className={s.classGrid}>{classes.map(clase => <Link href={`/clases/${clase.id}`} className={s.classCard} key={clase.id}><span className={s.eyebrow}>{clase.day} · {clase.time}</span><h2>{clase.name}</h2><p>{clase.teacher}</p><div className={s.cardFoot}><span>{clase.room}</span><strong>{data?.students.filter(student => student.classId === clase.id).length} / {clase.capacity} alumnos</strong></div></Link>)}</div>;
  }
  return <div className={s.app}>
    <a className={s.skip} href="#main">Saltar al contenido</a>
    <aside className={s.sidebar}>
      <div className={s.brand}><span className={s.brandMark}>SOI</span><div><strong>El Sistema Punta Cana</strong><small>FUNEYCA PC</small></div></div>
      <button className={s.menuButton} ref={menuButton} aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen(!menuOpen)}>Menú {menuOpen ? '−' : '+'}</button>
      <nav id="primary-nav" aria-label="Navegación principal" className={menuOpen ? s.navOpen : s.nav} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }}>
        <p className={s.navLabel}>ESPACIO ACADÉMICO</p>
        <Link href="/academico" current={route.page === 'home'}><span aria-hidden="true">01</span> Inicio académico</Link>
        <Link href="/administrativo" current={route.page === 'students' || route.page === 'student'}><span aria-hidden="true">02</span> Alumnos</Link>
        <Link href="/academico/clases" current={route.page === 'classes' || route.page === 'class'}><span aria-hidden="true">03</span> Clases y horarios</Link>
        <div className={s.upcoming}><p className={s.navLabel}>PRÓXIMAS ENTREGAS</p><p>Asistencia <small>Pendiente</small></p><p>Planificación <small>Pendiente</small></p><p>Hermes <small>Pendiente</small></p></div>
      </nav>
      <div className={s.sidebarFoot}><strong>SOI 2.0</strong><small>Primera demo académica</small></div>
    </aside>
    <div className={s.workspace}>
      <header className={s.topbar}><span>FUNEYCA PC <span className={s.separator}>/</span> Académico</span><span className={s.demoBadge}>DEMOSTRACIÓN</span></header>
      <div className={s.demoNotice}><strong>Datos ficticios.</strong> Esta demo no consulta ni modifica la información real del SOI.</div>
      <main id="main" className={s.main}>
        {(route.page === 'student' || route.page === 'class') && <Link href={route.page === 'student' ? '/administrativo' : '/academico/clases'} className={s.back}>← Volver a {route.page === 'student' ? 'alumnos' : 'clases'}</Link>}
        <div className={s.pageTitle}><div><p className={s.eyebrow}>EL SISTEMA PUNTA CANA</p><h1 ref={heading} tabIndex={-1}>{title}</h1></div>{route.page === 'home' && <Link href="/administrativo?filter=unassigned" className={s.primary}>Revisar alumnos sin clase</Link>}</div>
        {error ? <div role="alert" className={s.empty}><h2>No pudimos cargar la demo</h2><button onClick={() => setRetry(retry + 1)}>Reintentar</button></div> : !data ? <p role="status">Cargando datos de demostración…</p> : missing ? <div className={s.empty}><p>La dirección o el registro solicitado no existe en esta demo.</p><Link href="/academico">Volver al inicio</Link></div> : <>
          {route.page === 'home' && <>
            <p className={s.intro}>Alumnos, clases y pendientes que necesitan seguimiento.</p>
            <div className={s.stats}>{[[active.length,'Alumnos activos','/administrativo'],[unassigned.length,'Activos sin clase','/administrativo?filter=unassigned'],[absence.length,'Con ausencias de ejemplo','/administrativo?filter=absence'],[contact.length,'Contactos por verificar','/administrativo?filter=contact']].map(([value,label,href]) => <Link href={String(href)} className={s.stat} key={String(label)}><strong>{value}</strong><span>{label}</span><small>Ver alumnos →</small></Link>)}</div>
            <section className={s.panel}><div className={s.sectionHeader}><div><p className={s.eyebrow}>PRIORIDAD DE REVISIÓN</p><h2>Que ningún alumno quede sin clase</h2></div><span className={s.warning}>{unassigned.length} pendientes de ejemplo</span></div><StudentTable students={unassigned}/></section>
            <section><div className={s.sectionHeader}><h2>Clases de demostración</h2><Link href="/academico/clases">Ver todas las clases →</Link></div><ClassCards classes={data.classes}/></section>
          </>}
          {route.page === 'students' && <section className={s.panel}>
            <div className={s.filters}><label>Buscar alumno o cátedra<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre o instrumento"/></label><label>Mostrar<select value={filter} onChange={event => navigate('/administrativo' + (event.target.value === 'all' ? '' : `?filter=${event.target.value}`))}><option value="all">Todos los alumnos</option><option value="unassigned">Activos sin clase</option><option value="absence">Con dos o más ausencias de ejemplo</option><option value="contact">Contacto por verificar</option></select></label></div>
            <p className={s.resultCount} role="status">{filterStudents(data.students,query,filter).length} alumnos · datos ficticios</p><StudentTable students={filterStudents(data.students,query,filter)}/>
          </section>}
          {route.page === 'classes' && <><p className={s.intro}>Horario semanal de ejemplo. Abre una clase para consultar su nómina.</p><ClassCards classes={data.classes}/></>}
          {selectedStudent && <><div className={s.detailGrid}><section className={s.panel}><div className={s.sectionHeader}><h2>Ficha del alumno</h2><span className={s.badge}>{selectedStudent.status === 'activo' ? 'Activo' : 'Inactivo'}</span></div><dl><dt>Cátedra</dt><dd>{selectedStudent.instrument}</dd><dt>Nivel</dt><dd>{selectedStudent.level}</dd><dt>Contacto del representante</dt><dd>{selectedStudent.contactVerified ? 'Verificado en el ejemplo' : 'Pendiente de verificar'}</dd><dt>Ausencias de ejemplo</dt><dd>{selectedStudent.absences} · Sin período real asociado</dd></dl></section><section className={s.panel}><div className={s.sectionHeader}><h2>Asignación académica</h2></div><div className={s.detailBody}>{selectedStudent.classId ? <><p>Inscrito en una clase de demostración.</p><Link href={`/clases/${selectedStudent.classId}`} className={s.primary}>Ver clase y nómina</Link></> : <><span className={s.warning}>Sin clase asignada</span><p>{selectedStudent.status === 'activo' ? 'Este alumno activo necesita revisión de su asignación.' : 'El alumno está inactivo. Revisar su estado antes de una asignación.'}</p><Link href="/academico/clases">Consultar clases disponibles</Link></>}<p className={s.note}>La asignación y edición de datos estarán disponibles en una próxima entrega.</p></div></section></div></>}
          {selectedClass && <><section className={s.panel}><div className={s.classMeta}><div><small>MAESTRO</small><strong>{selectedClass.teacher}</strong></div><div><small>HORARIO SEMANAL</small><strong>{selectedClass.day} · {selectedClass.time}</strong></div><div><small>SALÓN</small><strong>{selectedClass.room}</strong></div></div></section><section className={s.panel}><div className={s.sectionHeader}><h2>Nómina de clase</h2><span className={s.badge}>{data.students.filter(student => student.classId === selectedClass.id).length} / {selectedClass.capacity} alumnos</span></div><StudentTable students={data.students.filter(student => student.classId === selectedClass.id)}/></section><p className={s.note}>Registro de asistencia: pendiente de implementación. Esta pantalla solo consulta la nómina de ejemplo.</p></>}
        </>}
      </main><footer className={s.footer}>SOI 2.0 · FUNEYCA PC <span>Demo sin conexión a producción</span></footer>
    </div>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
