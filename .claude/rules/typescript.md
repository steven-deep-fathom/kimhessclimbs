---
paths: "**/*.ts,**/*.tsx"
---

# TypeScript Rules

## Type Safety
- Never use `any` - use `unknown` or proper types
- Define interfaces for all component props
- Use type inference where possible
- Export types from `types.ts`

## Naming Conventions
- Interfaces: PascalCase with Props suffix for components (`ExpeditionCardProps`)
- Types: PascalCase (`Expedition`, `BlogPost`)
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE for module-level constants

## React Components
- Always define prop interface above component
- Use `React.FC<Props>` for functional components
- Set `displayName` for debugging
- Use named exports

## Example Pattern

```typescript
interface MyComponentProps {
  title: string
  onClick: () => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>
}

MyComponent.displayName = 'MyComponent'
```
