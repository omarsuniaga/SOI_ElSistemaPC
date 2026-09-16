# Reporte de saneamiento — inventario AGOSTO 2026

Fuente: `INVENTARIO EL SISTEMA PUNTA CANA 2026.xlsx` · hoja `AGOSTO 2026` · generado dry-run (no toca la DB)

## Totales
- Instrumentos parseados: **317**
- Materiales/accesorios: **30**
- Con código válido: 272 · sin código: 45
- Tipo reconocido: 303 · no reconocido: 14
- Con tamaño: 154 · con serial: 104
- Asignados a un alumno: 104

## Distribuciones

**familia**: {"cuerdas":154,"maderas":88,"metales":29,"null":14,"percusion":24,"pianos":8}

**tipo_instrumento**: {"contrabajo":9,"guitarra":6,"viola":11,"violin":111,"violoncello":17,"clarinete":26,"fagot":2,"flauta_dulce":26,"flauta_dulce_alto":3,"flauta_trasversa":15,"flauta_trasversa_piccolo":1,"oboe":6,"saxofon_alto":6,"saxofon_soprano":1,"saxofon_tenor":2,"bombardino":1,"corneta":3,"corno_frances":4,"fliscorno":1,"trombon":5,"trompeta":13,"tuba_mi_bemol":1,"tuba_si_bemol":1,"null":14,"bateria":1,"bombo":3,"bongo":2,"campana":2,"campanas_tubulares":1,"clave":1,"guira":3,"pandereta":1,"platillos":1,"timpani":3,"triangulo":2,"xilofono":4,"teclado":3,"teclado_digital":1,"piano":1,"piano_digital":3}

**tamano**: {"3/4":46,"1/2":31,"4/4":60,"PEQUEÑA":2,"16\"":4,"1/4":7,"1/8":3,"7/8":1,"null":163}

**estado_uso**: {"prestado":104,"disponible":186,"en_reparacion":27}

**estado_conservacion**: {"excelente":102,"regular":26,"bueno":184,"mantenimiento":5}

## Ambigüedades / revisar a mano

### Códigos duplicados (0)

### Sin código válido (45)
- fila 314: BAQUETA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 315: BAQUETA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 316: BAQUETA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 317: BAQUETA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 318: BAQUETA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 319: BAQUETA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 320: BAQUETAS / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 321: BAQUETAS DE TIMPANI / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 322: BATERIA / cod_original="null" / asignado="DEPÓSITO BACH"
- fila 323: BOMBO / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 324: BOMBO / cod_original="D14080Q4822" / asignado="SALÓN BUSTAMANTE"
- fila 325: BOMBO / cod_original="null" / asignado="DEPÓSITO BACH"
- fila 326: BONGO / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 327: CAMPANA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 328: CAMPANA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 329: CAMPANAS TUBULARES / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 330: CLAVE / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 331: GUIRA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 332: GUIRA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 333: GUIRA PEQUEÑA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 334: PALILLOS 2 / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 335: PANDERETA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 336: PLATILLOS DE CHOQUE / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 337: TIMPANI / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 338: TIMPANI / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 339: TIMPANI / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 340: TRIANGULO / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 341: TRIANGULO / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 342: XILOFONO / cod_original="null" / asignado="ASIGNADO"
- fila 343: XILOFONO / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 344: BONGOS / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 345: XILOFONO / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 346: XILOFONO / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 347: PADS DE GOMA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 348: PADS DE GOMA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 349: PADS DE GOMA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 350: PADS DE GOMA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 351: PADS DE GOMA / cod_original="null" / asignado="SALÓN BUSTAMANTE"
- fila 362: TECLADO / cod_original="null" / asignado="SALON ELILA MENA"
- fila 363: TECLADO DIGITAL / cod_original="null" / asignado="SALON VIVALDI"
- fila 364: PIANO / cod_original="YBEMO1130" / asignado="DEPÓSITO BACH"
- fila 366: PIANO DIGITAL / cod_original="YFEL03626" / asignado="TALLER DE LUTHERIA"
- fila 367: PIANO DIGITAL / cod_original="YBY-06782" / asignado="ASIGNADO"
- fila 368: TECLADO / cod_original="null" / asignado="DEPOSITO BACH"
- fila 369: TECLADO / cod_original="YBAXD9498" / asignado="SALON BACH"

### Tipo no reconocido (14)
- fila 314: "BAQUETA" cod=null
- fila 315: "BAQUETA" cod=null
- fila 316: "BAQUETA" cod=null
- fila 317: "BAQUETA" cod=null
- fila 318: "BAQUETA" cod=null
- fila 319: "BAQUETA" cod=null
- fila 320: "BAQUETAS" cod=null
- fila 321: "BAQUETAS DE TIMPANI" cod=null
- fila 334: "PALILLOS 2" cod=null
- fila 347: "PADS DE GOMA" cod=null
- fila 348: "PADS DE GOMA" cod=null
- fila 349: "PADS DE GOMA" cod=null
- fila 350: "PADS DE GOMA" cod=null
- fila 351: "PADS DE GOMA" cod=null

### Materiales detectados
- GRASA · SUPERSLICK TUNING SLIDE GREASE · cant=21 · Grasa para bombas y corchos
- ACEITE · SUPERSLICK ALPHA SYNTH PREMIUM · cant=12 · Aceite para valvulas y rotores
- AFINADORES · TUNER CANDY TCT-60M · cant=16 · Afinador digital con microfono de pinza, 4 afinadores asignados
- ACEITE · YAMAHA SLIDE LUBRICANT · cant=14 · Aceite para la vara del trombón
- ACEITE · SUPERSLICK ALPHA SYNTH PREMIUM · cant=12 · Aceite para la vara del trombón (Envase blanco letras negras) Trombone Handslide Lube)
- KIT DE LIMPIEZA · YAMAHA  · cant=18 · Kit de limpieza para trompeta, trae aceite, grasa y una paño.
- CAÑAS DE CLARINETE 3 · VANDOREN PARIS · cant=49 · Caña de clarinete tamaño 3
- CAÑAS DE CLARINETE 2 · VANDOREN PARIS · cant=8 · Caña de clarinete tamaño 2
- BAQUETAS DE XILOFONO · PROMARK  · cant=3 (Par) · Baquetas para xilofono, de goma verde, rosada y de hilo.
- BAQUETAS DE REDOBLANTE · PROMARK  · cant=2 (Par) · Baquetas para redoble, de distinto tamaño en la punta.
- BOLSO PARA BAQUETAS · PROMARK  · cant=1 · Bolso para porta baquetas
- BAQUETAS PARA TIMPANI · PROMARK PST1 · cant=3 (Par) · Baquetas para timpani
- BAQUETAS PARA TIMPANI · PROMARK PST3 · cant=3 (Par) · Baquetas para timpani
- BAQUETAS PARA TIMPANI · PROMARK PST4 · cant=3 (Par) · Baquetas para timpani
- SORDINA DE TROMBON ·   · cant=4 · 2 sordinas de madera y 2 de metal
- CAÑA DE FAGOT · JONES MEDIUM SOFT · cant=10 · Cañas de fagot de hilo morado
- CAÑA DE FAGOT ·   · cant=? · 
- CAÑAS DE OBOE · JONES MEDIUM SOFT · cant=4 · Cañas de oboe de hilo morado
- CAÑAS DE OBOE ·   · cant=1 · Cañas de oboe de hilo rojo
- CAÑAS DE CLARINETE 2 · RICO  · cant=4 · 
- CAÑAS DE CLARINETE 2 Y 3.5 · STEVER  · cant=3 · Dos cañas 3.5 y una caña 2
- CEPILLO PARA BOQUILLAS · BANDWAGON BRASSWIND · cant=5 · Cepillo para limpiar boquillas de vientos metales
- CEPILLO PARA VALVULAS · BANDWAGON SMALL · cant=5 · Cepillo para limpiar valvulas de vientos metales
- CEPILLO SNAKE · BANDWAGON TROMBONE · cant=4 · Cepillo limpiador tipo serpiente para trombón
- CEPILLO SNAKE · BANDWAGON TROMPETA Y CORNETA · cant=6 · Cepillo limpiador tipo serpiente para trompeta y corneta
- CEPILLO SNAKE · SUPERSLICK TROMPETA Y CORNETA · cant=10 · Cepillo limpiador tipo serpiente para trompeta y corneta
- CLAVIJAS DE CELLO ·   · cant=2 (Juegos) · Clavijas de violoncello
- ACEITE PARA VALVULAS · BANDWAGON TROMPETA · cant=20 · Aceite para valvulas
- GRASA PARA CORCHO · BANDWAGON  · cant=6 · Grasa para corchos (Clarinete, oboe, fagot y saxofon)
- ENSAVE DE SPRAY · SUPERSLICK  · cant=12 · 
