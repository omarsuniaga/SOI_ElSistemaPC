-- Seed: Ruta de Violín v1
DO $$
DECLARE
    v_route_id UUID;
    v_version_id UUID;
    v_block_id UUID;
    v_level_id UUID;
    v_node_id UUID;
    v_level_count INT;
BEGIN
    -- 1. Crear Ruta
    INSERT INTO public.routes (name, description)
    VALUES ('Violín', 'Ruta académica oficial para el aprendizaje de violín, desde nivel básico hasta avanzado.')
    RETURNING id INTO v_route_id;

    -- 2. Crear Versión de Ruta
    INSERT INTO public.route_versions (route_id, version_number, is_current, change_log)
    VALUES (v_route_id, 1, true, 'Versión inicial de la ruta de violín con 10 niveles.')
    RETURNING id INTO v_version_id;

    -- 3. Crear Bloque: Básico (Niveles 1-5)
    INSERT INTO public.blocks (route_version_id, name, order_index)
    VALUES (v_version_id, 'Básico', 1)
    RETURNING id INTO v_block_id;

    -- 4. Generar 10 Niveles
    FOR v_level_count IN 1..10 LOOP
        -- Cambiar bloque al llegar al nivel 6
        IF v_level_count = 6 THEN
            INSERT INTO public.blocks (route_version_id, name, order_index)
            VALUES (v_version_id, 'Intermedio', 2)
            RETURNING id INTO v_block_id;
        END IF;

        INSERT INTO public.levels (block_id, name, order_index)
        VALUES (v_block_id, 'Nivel ' || v_level_count, v_level_count)
        RETURNING id INTO v_level_id;

        -- 5. Agregar Nodos Críticos (Sonido y Afinación) en cada nivel
        INSERT INTO public.nodes (level_id, name, is_critical, order_index)
        VALUES (v_level_id, 'Sonido', true, 1)
        RETURNING id INTO v_node_id;

        -- Indicadores para Sonido
        INSERT INTO public.indicators (node_id, description, order_index)
        VALUES 
            (v_node_id, 'Producción de tono limpio sin ruidos parásitos.', 1),
            (v_node_id, 'Control del punto de contacto y velocidad del arco.', 2);

        INSERT INTO public.nodes (level_id, name, is_critical, order_index)
        VALUES (v_level_id, 'Afinación', true, 2)
        RETURNING id INTO v_node_id;

        -- Indicadores para Afinación
        INSERT INTO public.indicators (node_id, description, order_index)
        VALUES 
            (v_node_id, 'Entonación precisa de los intervalos trabajados.', 1),
            (v_node_id, 'Capacidad de corregir la afinación auditivamente.', 2);

        -- 6. Agregar un Nodo Regular (Postura)
        INSERT INTO public.nodes (level_id, name, is_critical, order_index)
        VALUES (v_level_id, 'Postura', false, 3)
        RETURNING id INTO v_node_id;

        -- Indicadores para Postura
        INSERT INTO public.indicators (node_id, description, order_index)
        VALUES 
            (v_node_id, 'Posición correcta del cuerpo y del instrumento.', 1),
            (v_node_id, 'Sujeción relajada del arco.', 2);

    END LOOP;

END $$;
