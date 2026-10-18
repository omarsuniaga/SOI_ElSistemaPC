// Mounts the real admin view and exposes the Supabase client for scripted sign-in. Local validation only.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { supabase } from '../../../../src/lib/supabaseClient.js';
import { renderDocumentosPublicosView } from '../../../../src/modules/documentos-publicos/views/documentosPublicosView.js';

window.__sb = supabase;
window.__mount = () => renderDocumentosPublicosView(document.getElementById('app'));
