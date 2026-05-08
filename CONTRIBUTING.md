# Contribuir

¡Gracias por tu interés en contribuir al Sistema Académico PWA!

## Cómo Contribuir

1. **Fork** del repositorio
2. Crear una rama feature: `git checkout -b feature/nombre`
3. **Commit** con mensajes descriptivos: `git commit -m 'feat: descripción'`
4. **Push** a tu fork: `git push origin feature/nombre`
5. Abrir un **Pull Request**

## Convenciones de Código

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **TypeScript**: Tipado explícito, sin `any`
- **Nombres**: camelCase para variables/funciones, PascalCase para componentes
- **Testing**: Tests requeridos para lógica de negocio

## Estructura del Proyecto

```
src/
├── lib/          #.Supabase client
├── components/   # Componentes reutilizables
├── pages/        # Vistas/routes
└── shared/      # Utilidades
```

## Requisitos Previos

- Node.js 18+
- npm 9+

## Pull Requests

- Descrbir qué resuelve el PR
- Screenshots si hay cambios visuales
- Tests pasando