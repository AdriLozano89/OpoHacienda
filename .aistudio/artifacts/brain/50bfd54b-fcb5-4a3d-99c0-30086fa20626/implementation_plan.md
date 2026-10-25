# Centro de Alto Rendimiento OpoHacienda: Simulador de Supuestos Prácticos, Calculadora LGT y Dashboard de Rendimiento Oficial

Plan integral para equipar la plataforma con todas las herramientas prácticas indispensables para asegurar la plaza en el Cuerpo de Agentes de la Hacienda Pública (C2 en noviembre) y preparar la promoción a Técnicos de Hacienda (C1 en 2028).

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones Confirmadas con el Usuario en la Fase de Clarificación:**
> - **Centro de Alto Rendimiento Integral**: Se incorporan de forma cohesionada el Simulador de Supuestos Prácticos del 2º Ejercicio, la Calculadora Interactiva de Cómputo de Plazos y Recargos LGT, y el Cronograma de Estudio con cuenta atrás para noviembre.
> - **Dashboard de Evolución Oficial**: Monitorización de notas netas calculadas con el baremo oficial AEAT (+1 acierto, -0,25 fallo), evolución temporal, y radar de detección de temas débiles y artículos más fallados.
> - **Preparación del Segundo Examen (Supuestos Prácticos)**: Casos prácticos guiados con liquidaciones tributarias, cálculo de recargos del art. 27 LGT, intereses de demora, orden legal de prelación de embargos (art. 169 LGT), y plazos de pago en voluntaria y ejecutiva (art. 62 LGT).

---

## 1. Overview & Core Concept

### Qué resuelve la ampliación
Aprobar la oposición de Agentes de la Hacienda Pública (C2) no solo exige memorizar los artículos tipo test del primer ejercicio, sino dominar la resolución de **supuestos prácticos reales del segundo ejercicio**, el **cómputo matemático de plazos procesales/administrativos** y mantener una **estrategia cuantitativa rigurosa** que garantice superar la nota de corte en noviembre.

### Módulos Principales Nuevos
1. **Simulador de Supuestos Prácticos (Segundo Ejercicio C2/C1)**: Casos de inspección, gestión y recaudación oficial con desglose paso a paso:
   - Supuesto 1: *Recargo por declaración extemporánea sin requerimiento previo (art. 27 LGT)* y compatibilidad con intereses y sanciones.
   - Supuesto 2: *Procedimiento de Apremio y Ejecución de Embargos (arts. 167-173 LGT)*: orden de bienes embargables, cálculo de la providencia de apremio y plazos del art. 62.5 LGT.
   - Supuesto 3: *Notificaciones defectuosas y cómputo de plazos de caducidad e interrupción de la prescripción (arts. 66-70 LGT y 104 LGT)*.
   - Supuesto 4: *Aplazamiento y fraccionamiento de deudas tributarias (art. 65 LGT y RGR)*: garantías necesarias, dispensa y plazos.
2. **Calculadora Interactiva de Cómputo de Plazos y Recargos LGT**:
   - Selector de fecha de notificación y cómputo automático de plazos en días hábiles (art. 30 LPAC) y de fecha a fecha (meses).
   - Generador automático de plazos de pago en periodo voluntario (art. 62.2: quincena 1 al 15 vs 16 al último día).
   - Calculadora de recargos del art. 27 LGT (1% + 1% por mes completo) e interés de demora cuando supere 12 meses.
3. **Dashboard de Rendimiento y Radar de Debilidades**:
   - Estadísticas de nota neta oficial sobre 100 y percentil estimado de corte.
   - Historial de simulacros realizados con desglose por bloques (Organización del Estado, Derecho Administrativo, Inspección, Recaudación).
   - Lista dinámica de "Artículos Críticos Pendientes de Dominar" generada a partir de los errores en tests y supuestos.
4. **Cronograma y Planificador de Estudio con Cuenta Atrás Oficial**:
   - Cuenta atrás en días, horas y sesiones para el examen C2 de noviembre.
   - Planificador semanal de temas recomendados por el preparador según la Curva del Olvido y la tasa de error del opositor.

---

## 2. User Experience & Visual Design

### Flujo de Navegación Cohesionado
* **Sidebar (PC) & Bottom Nav (Móvil)**:
  - Nueva sección destacada: 📑 **Supuestos Prácticos** (casos reales con paso a paso y justificación en normativa).
  - Nueva sección: ⏱️ **Calculadora LGT** (herramienta interactiva para calcular plazos y liquidaciones al instante).
  - Nueva sección: 📊 **Mi Rendimiento** (dashboard con evolución de notas netas y semáforo de temas).
  - El menú móvil integra acceso rápido con un cajón modal ("Más") sin saturar la barra inferior de 4 iconos principales.

### Dirección Visual Oficial AEAT
* **Paleta 60-30-10 estricta**:
  - `60%`: Fondo neutro limpio (`#F8FAFC` en claro / `#00142B` en oscuro).
  - `30%`: Superficies estructurales azul institucional de la AEAT (`#003366`) y contenedores con bordes hairline (`border-slate-200 dark:border-slate-800`).
  - `10%`: Acentos funcionales de precisión: Granate AEAT (`#AA151B`) para errores y plazos perentorios; Amarillo Gualda (`#D4AF37`) para elementos activos y resaltados legales; Esmeralda (`#059669`) para respuestas y cálculos correctos.
* **Tipografía**:
  - Titulares e interfaces en `Plus Jakarta Sans` y `DM Sans`.
  - Cifras, importes en euros (€), porcentajes de recargo, artículos y fechas con cifras monoespaciadas tabulares (`font-mono tabular-nums`).
* **Zero-Pill Discipline**: Sin cápsulas decorativas o píldoras innecesarias. Metadatos representados con texto limpio y separadores sutiles (`·`, `/`).

---

## 3. Key Product Decisions & Trade-Offs

### Decisión 1: Supuestos Prácticos Interactivos Guiados con Corrección Analítica
- **Enfoque Elegido**: Cada supuesto se compone del relato de hechos fácticos oficiales (como en el examen real de la AEAT), seguido de una serie de preguntas de desarrollo/numéricas tipo test estructurado. El opositor responde y recibe inmediatamente la hoja de liquidación explicada paso a paso con los artículos exactos de la LGT y reglamentos.
- **Por qué**: En el segundo examen de Agentes no basta con saberse el artículo; hay que saber liquidar (euros de recargo, fecha exacta de inicio y fin de apremio). Proporcionar la solución guiada entrena la mente del opositor en la operativa real del tribunal.

### Decisión 2: Calculadora de Plazos y Recargos en el Cliente (Sin Latencia)
- **Enfoque Elegido**: Motor de cálculo matemático y de calendario implementado directamente en TypeScript en el cliente, capaz de operar tanto con conexión como sin conexión (offline PWA).
- **Por qué**: Permite practicar con fechas reales al instante sin esperas ni consumo de tokens, funcionando incluso en el metro o biblioteca sin cobertura.

### Decisión 3: Métricas de Baremo Real AEAT en el Dashboard
- **Enfoque Elegido**: La nota neta se calcula estrictamente con la fórmula del tribunal:
  $$\text{Nota Neta} = \text{Aciertos} \times 1.00 - \text{Errores} \times 0.25$$
  Se muestra la nota ponderada sobre 100 y la nota sobre 80 preguntas (examen oficial C2).
- **Por qué**: Muchos opositores suspenden porque en los simulacros no penalizan los fallos; ver la nota neta real acostumbra al opositor a la toma de decisiones sobre cuándo arriesgar o dejar en blanco.

---

## 4. Technical Architecture & Data Strategy

### System Layout & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Main Coordinator)                      │
│  - State: topics, reviewRecords, failedQuestions, testResultsHistory   │
│  - ActiveView: 'library' | 'test' | 'cases' | 'calc' | 'dashboard'     │
│                | 'curve' | 'errors' | 'summary' | 'traps'              │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    ┌───────────────┴───────────────┐  ┌─────────────┴─────────────┐
    │          Desktop              │  │          Mobile           │
    │        Sidebar.tsx            │  │      BottomNavBar.tsx     │
    │  (AEAT Blue / Dark Navy)      │  │  (44px Touch Targets)     │
    └───────────────────────────────┘  └───────────────────────────┘
                    │
   ┌────────────────┴─────────────────────────────────────────────┐
   │                    Active View Workspaces                    │
   ├───────────────────────────────┬──────────────────────────────┤
   │ 1. PracticalCasesTab.tsx      │ 2. LGTCalculatorTab.tsx      │
   │    - Official Case Scenarios  │    - Article 30 LPAC Days    │
   │    - Step-by-Step Resolution  │    - Article 62 LGT Quincenas│
   │    - Legal Article Reasoning │    - Article 27 LGT Surcharges│
   ├───────────────────────────────┼──────────────────────────────┤
   │ 3. PerformanceDashboard.tsx   │ 4. StudyPlannerCountdown.tsx │
   │    - Official Net Score Chart │    - November Exam Milestones│
   │    - Topic Weakness Matrix    │    - Daily Focus Strategy    │
   │    - Historical Test Logs     │    - Ebbinghaus Sync         │
   ├───────────────────────────────┴──────────────────────────────┤
   │ Existing Modules: TestTab (10/25/50/80 Q) · ForgettingCurve  │
   │                   SummaryTab · FlashcardsTab · TrapsTab      │
   └──────────────────────────────────────────────────────────────┘
```

### Modelos de Datos Nuevos
1. **PracticalCaseScenario**:
   - `id`: string
   - `title`: string (ej: "Liquidación de Recargo Extemporáneo del Art. 27 LGT")
   - `examExercise`: 'C2_2nd' | 'C1_2nd'
   - `caseDescription`: string (hechos, fechas de presentación, cuantías declaradas)
   - `steps`: Array con preguntas de resolución numérica y jurídica, opciones, respuesta correcta, cálculo en tabla y fundamento legal.
2. **TestResultLog**:
   - `id`: string
   - `date`: string ISO
   - `topicId`: string
   - `topicTitle`: string
   - `totalQuestions`: number (10, 25, 50, 80)
   - `correct`: number
   - `failed`: number
   - `blank`: number
   - `netScore`: number
   - `percentage`: number
3. **Persistencia**:
   - Todos los datos persisten automáticamente en `localStorage` con respaldo sin conexión PWA: `opohacienda_test_history`, `opohacienda_practical_progress`, `opohacienda_topics`.
