import { NavItem } from '@/shared/types';

/**
 * Navigation configuration
 * Used by sidebar and Cmd+K bar.
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Leads',
    url: '/dashboard/leads',
    icon: 'leads',
    isActive: false,
    shortcut: ['l', 'd'],
    items: []
  },
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'b'],
    isActive: false,
    items: []
  },
  {
    title: 'Account',
    url: '#',
    icon: 'account',
    isActive: true,
    items: [
      {
        title: 'Profile',
        shortcut: ['a', 'p'],
        url: '/dashboard/profile',
        icon: 'profile'
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/login',
        icon: 'login'
      }
    ]
  }
];
