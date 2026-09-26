-- Una preferencia no confiere una sección instrumental. Conservamos columnas y permisos de la vista.
-- No modificamos datos históricos: los instrumentos principales dudosos se revisan individualmente.
-- Vista: public."student_results"
CREATE OR REPLACE VIEW public."student_results" WITH (security_invoker = true) AS
SELECT s.id,
    s.nombre_completo AS name,
        CASE
            WHEN ((lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%violin%'::text) OR (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%violín%'::text) OR (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%volin%'::text)) THEN 'Violines I'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%viola%'::text) THEN 'Violas'::text
            WHEN ((lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%cello%'::text) OR (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%violoncello%'::text)) THEN 'Violoncellos'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%contrabajo%'::text) THEN 'Contrabajos'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%flauta%'::text) THEN 'Flautas'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%oboe%'::text) THEN 'Oboes'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%clarinete%'::text) THEN 'Clarinetes'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%corno%'::text) THEN 'Cornos'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%trompeta%'::text) THEN 'Trompetas'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%trombo%'::text) THEN 'Trombones'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%tuba%'::text) THEN 'Tuba'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%percu%'::text) THEN 'Percusión'::text
            WHEN (lower(NULLIF(btrim(s.instrumento_principal), '')) ~~ '%piano%'::text) THEN 'Pianistas'::text
            ELSE COALESCE(NULLIF(btrim(s.instrumento_principal), ''), 'Sin sección'::text)
        END AS section,
    count(e.id) AS eval_count,
    round(avg(e.score_escala), 1) AS avg_escala,
    round(avg(e.score_danzon), 1) AS avg_danzon,
    round(avg(e.score_total), 1) AS avg_total,
        CASE
            WHEN (avg(e.score_total) >= (28)::numeric) THEN 'A'::text
            WHEN (avg(e.score_total) >= (20)::numeric) THEN 'B'::text
            WHEN (avg(e.score_total) >= (12)::numeric) THEN 'C'::text
            WHEN (avg(e.score_total) >= (8)::numeric) THEN 'D'::text
            ELSE NULL::text
        END AS assigned_group
   FROM (alumnos s
     LEFT JOIN evaluations e ON ((s.id = e.student_id)))
  WHERE (s.activo = true)
  GROUP BY s.id, s.nombre_completo, s.instrumento_principal, s.instrumento_interes;
