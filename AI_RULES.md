# AI Development Rules

This document provides guidelines for the AI assistant to follow when developing and modifying this application. The goal is to maintain code quality, consistency, and adherence to the established architecture.

## Tech Stack Overview

The application is built on a modern, robust tech stack. Here are the key technologies in use:

-   **Framework & Build Tool**: React with Vite for a fast development experience.
-   **Language**: TypeScript for type safety and improved code quality.
-   **Backend as a Service**: Supabase for the database (PostgreSQL), authentication, storage, and serverless functions.
-   **Styling**: Tailwind CSS for all utility-first styling.
-   **UI Components**: **shadcn/ui** is the primary component library, built on top of Radix UI for accessibility.
-   **Data Fetching & Server State**: TanStack Query (React Query) is used for all asynchronous operations, caching, and server state management.
-   **Routing**: React Router (`react-router-dom`) handles all client-side routing.
-   **Forms & Validation**: React Hook Form is used for building forms, with Zod for schema validation.
-   **Icons**: Lucide React (`lucide-react`) is the designated icon library.
-   **Notifications**: `sonner` is used for toast notifications.

## Library Usage Guidelines

To ensure consistency, please adhere to the following rules for using specific libraries:

### UI Components (shadcn/ui)

-   **Rule**: **ALWAYS** use `shadcn/ui` components for all UI elements (e.g., `Button`, `Card`, `Dialog`, `Input`, `Select`).
-   **Reasoning**: This maintains a consistent design system and leverages pre-built, accessible components.
-   **Implementation**: Import components from `@/components/ui/...`. Do not create custom components for functionality that already exists in the library.

### Styling (Tailwind CSS)

-   **Rule**: Use Tailwind CSS utility classes for all styling. Avoid writing custom CSS files or using inline `style` attributes.
-   **Reasoning**: Keeps styling co-located with the markup and adheres to the project's design system.
-   **Implementation**: Apply classes directly in the JSX. Use `@apply` in `index.css` only for global base styles if absolutely necessary.

### Data Fetching & State (TanStack Query)

-   **Rule**: All interactions with the Supabase backend (fetching, creating, updating, deleting data) **MUST** be handled through TanStack Query hooks (`useQuery`, `useMutation`).
-   **Reasoning**: Provides robust caching, request de-duplication, and a consistent pattern for managing server state.
-   **Implementation**: Create custom hooks (e.g., `useCourses`, `useCreateTurma`) that encapsulate TanStack Query logic.

### Forms (React Hook Form & Zod)

-   **Rule**: All forms must be built using `react-hook-form`. All form validation must be done using `zod`.
-   **Reasoning**: This provides a performant and standardized way to handle forms and validation.
-   **Implementation**: Use the `useForm` hook and connect it to `shadcn/ui` form components. Define a Zod schema for validation.

### Routing (React Router)

-   **Rule**: Use `react-router-dom` for all page navigation and routing logic.
-   **Reasoning**: It's the standard routing library for this React application.
-   **Implementation**: Define all routes within `src/App.tsx`. Use `<Link>` or `useNavigate` for navigation.

### Icons (Lucide React)

-   **Rule**: **ONLY** use icons from the `lucide-react` library.
-   **Reasoning**: Ensures a consistent and high-quality icon set throughout the application.
-   **Implementation**: `import { IconName } from 'lucide-react';`

### Backend (Supabase)

-   **Rule**: All backend interactions must go through the shared Supabase client located at `@/integrations/supabase/client.ts`.
-   **Reasoning**: Centralizes the Supabase client configuration.
-   **Implementation**: `import { supabase } from '@/integrations/supabase/client';`

### Notifications (Sonner)

-   **Rule**: Use `sonner` for all toast notifications to the user (e.g., success messages, errors).
-   **Reasoning**: The `Toaster` component is already configured globally in `App.tsx`.
-   **Implementation**: `import { toast } from 'sonner';` and call `toast.success('Message')` or `toast.error('Message')`.

### Date Handling (date-fns)

-   **Rule**: Use `date-fns` for any date formatting or manipulation.
-   **Reasoning**: It's a lightweight and powerful library for working with dates.
-   **Implementation**: `import { format } from 'date-fns';`

### Charts (Recharts)

-   **Rule**: Use `recharts` for any data visualization or charts.
-   **Reasoning**: It's the designated charting library for this project.
-   **Implementation**: Import components from the `recharts` library as needed.

## General Rules

-   **File Structure**: Place new pages in `src/pages`, reusable components in `src/components`, and custom hooks in `src/hooks`.
-   **Componentization**: Create small, focused, and reusable components. Avoid creating monolithic components.
-   **Responsiveness**: All new components and pages must be fully responsive and tested on mobile, tablet, and desktop views.
-   **TypeScript**: Write all code in TypeScript and provide types for props, state, and function signatures.