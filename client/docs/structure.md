```text
src
├── app                      # routing only
│   ├── (auth)
│   ├── (dashboard)
│   └── layout.tsx

├── api
│   ├── client/
│   │   └── api-client.ts
│   └── modules/
│       ├── users/
│       ├── farmers/
│       ├── listings/

├── features
│   ├── farmers/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── pages/
│   │
│   ├── listings/
│   ├── users/

├── shared
│   ├── components/
│   │   ├── ui/
│   │   ├── table/
│   │   └── forms/
│   ├── hooks/
│   ├── utils/
│   └── types/

├── config/
├── styles/
└── middleware.ts
```
