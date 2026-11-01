# SlimDesk

The fast, lightweight CRM built for freelancers and modern agencies. Capture leads, track pipelines, and close deals without the enterprise bloat.

---

## Features

- **Visual Pipeline & Kanban**: Fluid drag-and-drop & zero-latency native board navigation.
- **High-Density Leads**: Instant stage filter tabs, search, and activity timelines.
- **Follow-ups & Alerts**: Scheduled reminders with overdue highlights so no deal slips.
- **1-Click Conversion**: Turn won leads directly into active clients.
- **Real-time Overview**: Track pipeline value, stage conversion, and closed revenue.

---

## Quickstart

```bash
# 1. Start MySQL database
docker compose up -d

# 2. Start Backend API (runs on http://localhost:3001)
cd server && npm install && npm run start:dev

# 3. Start Frontend App (runs on http://localhost:3000)
cd client && npm install && npm run dev
```

> **API Docs**: Swagger UI is available at `http://localhost:3001/api/docs`

---

## Stack

- **Web**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **API**: NestJS, TypeORM, MySQL 8.0, Swagger

---

## License

MIT
