# SlimDesk — Client

> A lightweight CRM for freelancers, agencies, and small businesses.

The frontend for SlimDesk, built with **Next.js 16**, **shadcn/ui**, **Tailwind CSS v4**, and **TypeScript**.

---

## Tech Stack

| Layer          | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) (App Router)                 |
| Language       | [TypeScript](https://www.typescriptlang.org)                   |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com)                     |
| Components     | [shadcn/ui](https://ui.shadcn.com)                             |
| State          | [Zustand](https://zustand-demo.pmnd.rs)                       |
| Search Params  | [Nuqs](https://nuqs.47ng.com)                                 |
| Tables         | [TanStack Table](https://tanstack.com/table)                   |
| Forms          | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Command Palette| [kbar](https://kbar.vercel.app)                                |
| Themes         | 6 built-in themes via [tweakcn](https://tweakcn.com)           |

---

## Features

- 🏠 **Landing page** — SaaS-style marketing page with hero, features, and CTA
- 🔐 **Authentication** — Login & register pages with email/password
- 📊 **Dashboard overview** — Cards + Recharts graphs with parallel routes (independent loading/error states)
- 📋 **Kanban board** — Drag-and-drop task management with dnd-kit + Zustand
- 🎨 **Multi-theme** — 6 themes (Claude, Vercel, Supabase, Neobrutualism, Mono, Notebook) with light/dark mode
- ⌘ **Command palette** — Cmd+K quick navigation via kbar
- 📱 **Responsive** — Mobile-first with collapsible sidebar

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group (login, register)
│   ├── dashboard/          # Dashboard routes
│   │   └── overview/       # Parallel routes (@area_stats, @bar_stats, etc.)
│   ├── about/
│   ├── privacy-policy/
│   ├── terms-of-service/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
│
├── features/               # Feature-based modules
│   ├── auth/               # Login, register, auth provider
│   │   ├── api/
│   │   ├── components/
│   │   ├── providers/
│   │   ├── types/
│   │   └── utils/
│   ├── kanban/             # Kanban board
│   ├── landing/            # Landing page
│   └── overview/           # Dashboard charts
│
├── shared/                 # Shared code
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Sidebar, header, providers
│   │   ├── form/           # Reusable form fields
│   │   ├── kbar/           # Command palette
│   │   ├── modal/          # Alert modals
│   │   └── themes/         # Theme provider, selector, config
│   ├── hooks/              # Custom hooks
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Utilities (API client, formatters, etc.)
│   └── constants/          # App constants
│
├── config/                 # App configuration
│   ├── nav-config.ts       # Sidebar navigation items
│   └── data-table.ts       # Table defaults
│
└── styles/                 # CSS
    ├── globals.css
    ├── theme.css
    └── themes/             # 6 theme files (claude, vercel, supabase, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / bun

### Install & Run

```bash
# Clone the repo
git clone https://github.com/Dhiraj275/SlimDesk.git
cd SlimDesk/client

# Install dependencies
npm install

# Create env file
cp env.example.txt .env.local
# Fill in the required environment variables

# Start dev server
npm run dev
```

The app will be available at **http://localhost:4001**.

---

## Planned Features (MVP)


- [ ] Leads management
- [ ] Clients management
- [ ] Deals pipeline (Kanban)
- [ ] Quotations
- [ ] Invoices
- [ ] Contracts
- [ ] Notes / Activity timeline
- [ ] Follow-ups & reminders
- [ ] Email templates

---

## Credits

Built on top of [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) by [Kiran](https://github.com/Kiranism).

---

## License

MIT
