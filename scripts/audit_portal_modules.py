import os
import re

def analyze_js_file(file_path):
    features = {
        'uses_supabase': False,
        'has_views': False,
        'has_tests': False,
        'uses_localstorage': False,
        'uses_router': False,
        'uses_auth': False,
        'functions': [],
        'render_views': []
    }
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
            # Análisis por expresiones regulares
            if 'supabase' in content.lower():
                features['uses_supabase'] = True
            if 'innerhtml =' in content.lower() or 'createelement' in content.lower():
                features['has_views'] = True
            if 'describe(' in content.lower() or 'test(' in content.lower() or 'it(' in content.lower():
                features['has_tests'] = True
            if 'localstorage' in content.lower():
                features['uses_localstorage'] = True
            if 'router.register' in content or 'window.router' in content:
                features['uses_router'] = True
            if 'useauth' in content.lower() or 'refreshauth' in content:
                features['uses_auth'] = True
                
            # Extraer funciones
            fn_matches = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', content)
            features['functions'] = fn_matches[:8]  # Limitado a las primeras 8
            
            # Extraer vistas que se renderean
            view_matches = re.findall(r'export\s+async\s+function\s+(render[a-zA-Z0-9_]+)\s*\(', content)
            features['render_views'] = view_matches
            
    except Exception as e:
        pass
        
    return features

def audit_directory(dir_path):
    report_items = {}
    
    if not os.path.exists(dir_path):
        return report_items
        
    for item in os.listdir(dir_path):
        item_path = os.path.join(dir_path, item)
        if os.path.isdir(item_path) and item != '__tests__' and item != 'node_modules':
            files_found = []
            features_summary = {
                'uses_supabase': False,
                'has_views': False,
                'has_tests': False,
                'uses_localstorage': False,
                'uses_router': False,
                'uses_auth': False,
                'functions': [],
                'render_views': [],
                'docs_found': []
            }
            
            # Escanear archivos en el subdirectorio de forma recursiva
            for root, _, files in os.walk(item_path):
                for file in files:
                    full_file_path = os.path.join(root, file)
                    rel_file_path = os.path.relpath(full_file_path, item_path)
                    
                    if file.endswith('.js') or file.endswith('.jsx') or file.endswith('.ts') or file.endswith('.tsx'):
                        files_found.append(rel_file_path)
                        f_feats = analyze_js_file(full_file_path)
                        
                        # Agregar features del archivo
                        features_summary['uses_supabase'] |= f_feats['uses_supabase']
                        features_summary['has_views'] |= f_feats['has_views']
                        features_summary['has_tests'] |= f_feats['has_tests']
                        features_summary['uses_localstorage'] |= f_feats['uses_localstorage']
                        features_summary['uses_router'] |= f_feats['uses_router']
                        features_summary['uses_auth'] |= f_feats['uses_auth']
                        features_summary['functions'].extend(f_feats['functions'])
                        features_summary['render_views'].extend(f_feats['render_views'])
                        
                    elif file.endswith('.md'):
                        features_summary['docs_found'].append(rel_file_path)
            
            # Limitar colecciones
            features_summary['functions'] = list(set(features_summary['functions']))[:8]
            features_summary['render_views'] = list(set(features_summary['render_views']))
            
            report_items[item] = {
                'path': item_path,
                'files': files_found[:12],
                'features': features_summary
            }
            
    return report_items

def generate_report(modules_audit, portales_audit, output_path):
    today = datetime.date.today().isoformat()
    
    # Determinar responsabilidades del departamento sugeridas en base al nombre
    def get_dept(name):
        name_lower = name.lower()
        if 'fin' in name_lower or 'caja' in name_lower: return 'FIN'
        if 'academ' in name_lower or 'acm' in name_lower or 'pedag' in name_lower or 'prog' in name_lower: return 'ACM'
        if 'log' in name_lower or 'invent' in name_lower or 'luter' in name_lower: return 'LOG'
        if 'com' in name_lower: return 'COM'
        if 'adm' in name_lower or 'usu' in name_lower: return 'ADM'
        if 'agt' in name_lower or 'herm' in name_lower: return 'AGT'
        return 'SIS'

    markdown = f"""---
doc_id: SIS-PORTAL-AUDIT-REPORT
doc_type: informe
version: V9
status: vigente
department: SIS
owner: Agente de Auditoria (AGT-AUDIT)
created_at: {today}
last_reviewed: {today}
next_review_due: {(datetime.date.today() + datetime.timedelta(days=180)).isoformat()}
canonical_path: docs/planning/ui/portal_functional_audit_report.md
related_docs:
  - "[[00_HOME|🏠 Volver al Home]]"
  - "[[Gemma/07_SOI_V8_SISTEMAS_PWA|🛠️ 07 Sistemas PWA Spec]]"
  - "[[00_SISTEMA_MAESTRO/SOI_INVENTARIO_Y_RELACION_PORTALES_V9|📋 Inventario de Portales V9]]"
---

# REPORTE DE AUDITORÍA DETALLADO DE PORTALES Y MÓDULOS WEB
## Ejecutado por: `AGT-AUDIT` (Observer Agent)

Este reporte detalla el escaneo estructural y de código de todos los submódulos activos de la SPA en `src/modules` y `src/portales`, mapeando las funciones encontradas con la gobernanza documental del SOI.

---

## 💻 PARTE 1: AUDITORÍA DE MÓDULOS DEL SISTEMA (`src/modules/`)
"""
    
    for name, data in sorted(modules_audit.items()):
        dept = get_dept(name)
        feats = data['features']
        
        # Deducir brechas de forma lógica en base al código físico
        brechas = []
        recomendaciones = []
        
        if feats['uses_supabase']:
            brechas.append("- **Acceso directo a base de datos:** El módulo realiza consultas directas de Supabase en las vistas.")
            recomendaciones.append("- **Refactorizar a DataAdapter:** Migrar el código a la abstracción de DataAdapter para desacoplar base de datos de UI.")
        
        if feats['has_views'] and not feats['has_tests']:
            brechas.append("- **Falta de cobertura de pruebas:** El módulo implementa interfaces visuales pero no cuenta con archivos de prueba unitaria.")
            recomendaciones.append("- **Añadir pruebas unitarias:** Implementar test en `__tests__` simulando interacciones DOM.")
            
        if not feats['docs_found']:
            brechas.append("- **Falta documentación en el módulo:** No se encontró ningún archivo `.md` de especificaciones técnicas dentro de la carpeta.")
            recomendaciones.append("- **Documentar en base:** Crear archivo `README.md` especificando la arquitectura interna del módulo.")
            
        if not brechas:
            brechas.append("- Ninguna brecha crítica detectada.")
            recomendaciones.append("- Mantener monitoreo y actualizaciones normales.")
            
        # Recomendar unificación si el módulo comparte lógica
        if 'caja' in name or 'finan' in name:
            recomendaciones.append("- **Unificación sugerida:** Evaluar fusionar con módulos de Finanzas.")

        markdown += f"""
### 📦 Módulo: `{name}`
*   **Ruta física:** `{os.path.relpath(data['path'], os.path.dirname(output_path))}`
*   **Propósito:** Gestión y controles del departamento **{dept}** en la PWA.
*   **Archivos principales encontrados:** {', '.join([f'`{f}`' for f in data['files'][:4]]) if data['files'] else 'Ninguno'}

#### ⚙️ Inventario Funcional:
*   **Vistas/Componentes:** {'Expone componentes de renderizado' if feats['has_views'] else 'Sin interfaz directa'}
*   **Servicios/APIs:** {'Conectado a Supabase Client' if feats['uses_supabase'] else 'Lógica offline / estática'}
*   **Persistencia Local:** {'Usa localStorage' if feats['uses_localstorage'] else 'Memoria de ejecución'}
*   **Funciones detectadas en código:**
    {', '.join([f'`{fn}()`' for fn in feats['functions']]) if feats['functions'] else '*Ninguna detectada*'}

#### 📘 Relaciones Documentales:
*   **Departamento SOI:** `{dept}`
*   **Documentación en carpeta:** {', '.join([f'`{d}`' for d in feats['docs_found']]) if feats['docs_found'] else '*Faltante*'}

#### ⚠️ Brechas Detectadas (Drift):
{chr(10).join(brechas)}

#### 💡 Recomendación de Acción:
{chr(10).join(recomendaciones)}

| Elemento | Estado | Acción recomendada |
| :--- | :--- | :--- |
| **Tareas** | {'parcial' if feats['uses_supabase'] else 'documentado'} | Integrar con paneles de Hermes. |
| **Funciones** | {'parcial' if not feats['has_tests'] else 'documentado'} | {'Agregar tests unitarios' if not feats['has_tests'] else 'Mantener'} |
| **Procedimientos** | {'faltante' if not feats['docs_found'] else 'documentado'} | {'Documentar lógica del proceso' if not feats['docs_found'] else 'Mantener'} |
| **Vistas** | {'documentado' if feats['has_views'] else 'faltante'} | {'Refactorizar interfaces' if feats['has_views'] else 'Crear vista'} |
| **Evidencia** | {'documentado' if feats['uses_supabase'] else 'faltante'} | Guardar logs en Supabase Storage (Gate 9). |

---
"""

    markdown += "\n\n## 🌐 PARTE 2: AUDITORÍA DE PORTALES (`src/portales/`)\n"
    
    for name, data in sorted(portales_audit.items()):
        dept = get_dept(name)
        feats = data['features']
        
        brechas = []
        recomendaciones = []
        
        if feats['uses_supabase']:
            brechas.append("- **Acceso Supabase en vistas:** Llamadas a Supabase hechas directamente en el portal.")
            recomendaciones.append("- **DataAdapter pattern:** Migrar el portal al DataAdapter de la PWA.")
        if not feats['docs_found']:
            brechas.append("- **Sin documentación interna:** El portal no tiene explicaciones de su comportamiento.")
            recomendaciones.append("- **Agregar especificación:** Documentar las vistas del portal.")
        if not brechas:
            brechas.append("- Ninguna brecha crítica detectada.")
            recomendaciones.append("- Mantener y monitorear.")

        markdown += f"""
### 🌐 Portal: `{name}`
*   **Ruta física:** `{os.path.relpath(data['path'], os.path.dirname(output_path))}`
*   **Propósito:** Interfaz de acceso al perfil del departamento **{dept}**.
*   **Archivos principales encontrados:** {', '.join([f'`{f}`' for f in data['files'][:4]]) if data['files'] else 'Ninguno'}

#### ⚙️ Inventario Funcional:
*   **Vistas/Componentes:** {'Expone componentes de renderizado' if feats['has_views'] else 'Sin interfaz directa'}
*   **Servicios/APIs:** {'Conectado a Supabase Client' if feats['uses_supabase'] else 'Lógica offline / estática'}
*   **Funciones detectadas en código:**
    {', '.join([f'`{fn}()`' for fn in feats['functions']]) if feats['functions'] else '*Ninguna detectada*'}

#### ⚠️ Brechas Detectadas (Drift):
{chr(10).join(brechas)}

#### 💡 Recomendación de Acción:
{chr(10).join(recomendaciones)}

| Elemento | Estado | Acción recomendada |
| :--- | :--- | :--- |
| **Tareas** | {'parcial' if feats['uses_supabase'] else 'documentado'} | Sincronizar con flujos Hermes. |
| **Funciones** | {'parcial' if not feats['has_tests'] else 'documentado'} | {'Agregar tests' if not feats['has_tests'] else 'Mantener'} |
| **Procedimientos** | {'faltante' if not feats['docs_found'] else 'documentado'} | {'Documentar' if not feats['docs_found'] else 'Mantener'} |
| **Vistas** | {'documentado' if feats['has_views'] else 'faltante'} | {'Optimizar UX responsiva' if feats['has_views'] else 'Crear vistas'} |
| **Evidencia** | {'documentado' if feats['uses_supabase'] else 'faltante'} | Persistir salidas en Supabase. |

---
"""

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown)
    print(f"[OK] Reporte de auditoria generado en: {output_path}")

if __name__ == "__main__":
    import datetime
    
    project_root = r"C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\09_SOI_WEB_PORTAL\sistema-academico-pwa"
    modules_dir = os.path.join(project_root, "src", "modules")
    portales_dir = os.path.join(project_root, "src", "portales")
    
    # Ruta destino en el repositorio de gobernanza del SOI
    output_md = r"C:\Users\omare\OneDrive\Documentos\SOI_Sistema_Operativo_Institucional\docs\planning\ui\portal_functional_audit_report.md"
    
    print("[*] Iniciando auditoría física de portales y módulos...")
    modules_audit = audit_directory(modules_dir)
    portales_audit = audit_directory(portales_dir)
    
    print("[*] Procesando mapeos y generando reporte markdown...")
    generate_report(modules_audit, portales_audit, output_md)
