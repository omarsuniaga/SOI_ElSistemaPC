/**
 * main.js — entrada mínima de la página pública /d/<slug>. No carga el shell
 * administrativo ni exige sesión; solo el cliente anónimo de Supabase.
 */
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './public.css'
import { renderDocumentoPublicoView, slugFromPath } from '../views/documentoPublicoView.js'

renderDocumentoPublicoView(document.getElementById('app'), slugFromPath(window.location.pathname))
