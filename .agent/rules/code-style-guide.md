---
trigger: always_on
---

# Eventrea Code Style Guide

This guide defines the coding standards and best practices for the Eventrea project, a Turborepo monorepo with Next.js frontend and NestJS microservices.

## General Principles

- **Consistency**: Follow existing patterns in the codebase
- **Type Safety**: Leverage TypeScript's type system fully
- **Readability**: Write self-documenting code with clear naming
- **Maintainability**: Keep functions small and focused
- **Standards**: Follow industry best practices for React and NestJS

## TypeScript Standards

### Type Annotations

- **Always use explicit types** for function parameters and return values
- **Use type inference** for variable declarations when the type is obvious
- **Prefer interfaces** over type aliases for object shapes
- **Use enums** for fixed sets of values (e.g., \`EventStatus\`)

\`\`\`typescript
// ✅ Good
export interface Venue {
name: string;
address: string;
city: string;
state?: string;
country: string;
coordinates?: Coordinates;
}

export enum EventStatus {
DRAFT = 'draft',
PUBLISHED = 'published',
CANCELLED = 'cancelled',
}

// ❌ Avoid
type Venue = {
name: string;
// ...
};
\`\`\`

### Imports

- **Group imports** in the following order:
  1. External libraries (React, Next.js, NestJS, etc.)
  2. Internal packages (\`@eventrea/_\`, \`@repo/_\`)
  3. Relative imports (components, utils, types)
- **Use named imports** instead of default imports when possible
- **Use absolute imports** with path aliases (\`@/\`) for frontend code

\`\`\`typescript
// ✅ Good
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ❌ Avoid mixing order
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
\`\`\`

## Frontend (Next.js/React) Standards

### Component Structure

- **Use functional components** with hooks
- **Use \`'use client'\`** directive for client components
- **Export named functions** for components
- **Keep components focused** - one component per file

\`\`\`typescript
// ✅ Good
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Navbar() {
const [isVisible, setIsVisible] = useState(true);

return (
<nav className="fixed top-0">
{/_ ... _/}
</nav>
);
}
\`\`\`

### Naming Conventions

- **Components**: PascalCase (e.g., \`Navbar\`, \`EventBanner\`, \`Footer\`)
- **Files**: Match component name (e.g., \`Navbar.tsx\`, \`EventBanner.tsx\`)
- **Hooks**: camelCase with \`use\` prefix (e.g., \`useSession\`, \`useAuth\`)
- **Utilities**: camelCase (e.g., \`cn\`, \`formatDate\`)
- **Constants**: UPPER_SNAKE_CASE (e.g., \`API_URL\`, \`MAX_RETRIES\`)

### State Management

- **Use \`useState\`** for local component state
- **Use \`useEffect\`** for side effects with proper dependencies
- **Extract custom hooks** for reusable stateful logic
- **Destructure hook returns** for clarity

\`\`\`typescript
// ✅ Good
const { data: session, isPending, error, refetch } = useSession();
const isAuthenticated = !!session;
const user = session?.user;

// ❌ Avoid
const sessionData = useSession();
const isAuthenticated = sessionData.data ? true : false;
\`\`\`

### Styling

- **Use Tailwind CSS** utility classes
- **Use \`cn()\` helper** for conditional classes
- **Follow responsive design** patterns (mobile-first)
- **Use semantic class names** for readability

\`\`\`typescript
// ✅ Good

<nav
  className={cn(
    'fixed top-0 left-0 right-0 z-50 w-full border-b bg-background',
    'transition-transform duration-300 ease-in-out',
    isVisible ? 'translate-y-0' : '-translate-y-full'
  )}
>

// ❌ Avoid inline styles or long single-line classes

<nav style={{ position: 'fixed' }} className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background transition-transform duration-300 ease-in-out">
\`\`\`

### JSX Patterns

- **Use semantic HTML** elements
- **Add accessibility attributes** (\`aria-\*\`, \`role\`, \`sr-only\`)
- **Keep JSX readable** with proper indentation
- **Extract complex conditions** into variables

\`\`\`typescript
// ✅ Good
{isAuthenticated ? (
<DropdownMenu>
{/_ ... _/}
</DropdownMenu>
) : (

  <div className="flex items-center gap-3">
    {/* ... */}
  </div>
)}

// Use sr-only for screen readers
<span className="sr-only">Profile</span>
\`\`\`

## Backend (NestJS) Standards

### Service Layer

- **Use \`@Injectable()\` decorator** for services
- **Inject dependencies** via constructor
- **Keep services focused** on business logic
- **Use async/await** for asynchronous operations

\`\`\`typescript
// ✅ Good
@Injectable()
export class EventsService {
constructor(private readonly eventRepository: EventsRepository) {}

async create(createEventDto: CreateEventDto) {
// Business logic here
return this.eventRepository.create(data);
}
}
\`\`\`

### Entity/Schema Definitions

- **Use \`@Schema()\` decorator** for Mongoose schemas
- **Use \`@Prop()\` decorator** for properties
- **Define enums** for fixed values
- **Add indexes** for frequently queried fields
- **Use TypeScript types** for sub-documents

\`\`\`typescript
// ✅ Good
export enum EventStatus {
DRAFT = 'draft',
PUBLISHED = 'published',
CANCELLED = 'cancelled',
}

@Schema({
timestamps: true,
collection: 'events',
})
export class Event {
@Prop({ required: true, trim: true, index: true })
title: string;

@Prop({
type: String,
enum: Object.values(EventStatus),
default: EventStatus.DRAFT,
index: true,
})
status: EventStatus;
}
\`\`\`

### DTOs (Data Transfer Objects)

- **Import from shared packages** (\`@eventrea/nestjs-common/dto\`)
- **Use validation decorators** for input validation
- **Keep DTOs simple** - only data structure

### Error Handling

- **Use try-catch blocks** for error-prone operations
- **Check error codes** for specific handling (e.g., MongoDB duplicate key)
- **Throw appropriate exceptions** (e.g., \`RpcException\`)
- **Provide meaningful error messages**

\`\`\`typescript
// ✅ Good
try {
await this.eventRepository.create({ ...createEventDto, slug });
created = true;
} catch (error: any) {
if (error?.code === 11000 && error?.keyValue?.slug) {
// Handle duplicate slug
slug = \`\${baseSlug}-\${randomString}\`;
} else {
throw error;
}
}
\`\`\`

## File Organization

### Directory Structure

\`\`\`
apps/
├── frontend/ # Next.js application
│ ├── app/ # App router pages
│ ├── components/ # React components
│ ├── lib/ # Utilities and helpers
│ └── public/ # Static assets
├── events/ # Events microservice
│ └── src/
│ ├── events/ # Events module
│ │ ├── dto/
│ │ ├── entities/
│ │ └── events.service.ts
│ └── main.ts
└── api-gateway/ # API Gateway
packages/
└── nestjs-common/ # Shared NestJS code
\`\`\`

### File Naming

- **Components**: \`ComponentName.tsx\`
- **Pages**: \`page.tsx\` (Next.js App Router)
- **Services**: \`feature.service.ts\`
- **Entities**: \`entity.entity.ts\`
- **DTOs**: \`feature.dto.ts\`
- **Utilities**: \`utility-name.ts\`

## Code Formatting

### Prettier Configuration

- **Use Prettier** for consistent formatting
- **Run format script**: \`pnpm format\`
- **Format on save** (recommended in IDE)

### ESLint

- **Follow Next.js ESLint config** for frontend
- **Fix linting errors** before committing
- **Run lint script**: \`pnpm lint\`

### Code Style

- **Use single quotes** for strings (enforced by Prettier)
- **Use semicolons** (enforced by Prettier)
- **2 spaces** for indentation
- **Max line length**: 80-100 characters (use judgment)
- **Trailing commas**: Yes (enforced by Prettier)

## Comments and Documentation

### When to Comment

- **Complex business logic** that isn't self-evident
- **Workarounds** or non-obvious solutions
- **TODOs** for future improvements
- **API documentation** (JSDoc for public APIs)

### Comment Style

\`\`\`typescript
// ✅ Good - Explains WHY
// Check if error is a duplicate key error (MongoDB error code 11000)
if (error?.code === 11000 && error?.keyValue?.slug) {
// Generate a random string and append to base slug
const randomString = randomBytes(4).toString('hex');
slug = \`\${baseSlug}-\${randomString}\`;
}

// ❌ Avoid - Explains WHAT (code is self-documenting)
// Set slug to baseSlug
slug = baseSlug;
\`\`\`

## Best Practices

### Performance

- **Use \`useMemo\`** for expensive computations
- **Use \`useCallback\`** for function references in dependencies
- **Implement proper indexes** in database schemas
- **Lazy load** components when appropriate

### Security

- **Validate all inputs** using DTOs
- **Sanitize user data** before database operations
- **Use environment variables** for sensitive data
- **Never commit secrets** to version control

### Testing

- **Write tests** for critical business logic
- **Use descriptive test names**
- **Follow AAA pattern**: Arrange, Act, Assert
- **Mock external dependencies**

### Git Practices

- **Write clear commit messages**
- **Keep commits focused** on single changes
- **Run linting and type checking** before committing
- **Use conventional commits** format (recommended)

## Monorepo Specifics

### Package Management

- **Use pnpm** as the package manager
- **Use workspace protocol** for internal dependencies
- **Keep dependencies updated** regularly

### Turbo Commands

- **Development**: \`pnpm dev\`
- **Build**: \`pnpm build\`
- **Lint**: \`pnpm lint\`
- **Format**: \`pnpm format\`
- **Type check**: \`pnpm check-types\`

### Shared Code

- **Extract common code** to packages (e.g., \`@eventrea/nestjs-common\`)
- **Version shared packages** appropriately
- **Document shared utilities** clearly

---

**Remember**: This guide is a living document. Update it as the project evolves and new patterns emerge.
EOF
