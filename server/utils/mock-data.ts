import type { Bank } from '~/types/status'

export const mockBanks: Bank[] = [
  {
    id: 1,
    slug: 'unionbank',
    name: 'UnionBank',
    status: 'up',
    lastChecked: new Date().toISOString(),
    endpoints: [
      { id: 1, bankId: 1, serviceType: 'website', url: 'https://unionbank.com', status: 'up', lastChecked: new Date().toISOString() },
      { id: 2, bankId: 1, serviceType: 'internet_banking', url: 'https://online.unionbank.com', status: 'up', lastChecked: new Date().toISOString() }
    ]
  },
  {
    id: 2,
    slug: 'securitybank',
    name: 'Security Bank',
    status: 'up',
    lastChecked: new Date().toISOString(),
    endpoints: [
      { id: 3, bankId: 2, serviceType: 'website', url: 'https://securitybank.com', status: 'up', lastChecked: new Date().toISOString() },
      { id: 4, bankId: 2, serviceType: 'internet_banking', url: 'https://online.securitybank.com', status: 'up', lastChecked: new Date().toISOString() }
    ]
  },
  {
    id: 3,
    slug: 'bdo',
    name: 'BDO',
    status: 'up',
    lastChecked: new Date().toISOString(),
    endpoints: [
      { id: 5, bankId: 3, serviceType: 'website', url: 'https://bdo.com.ph', status: 'up', lastChecked: new Date().toISOString() },
      { id: 6, bankId: 3, serviceType: 'internet_banking', url: 'https://online.bdo.com.ph', status: 'up', lastChecked: new Date().toISOString() }
    ]
  },
  {
    id: 4,
    slug: 'rcbc',
    name: 'RCBC',
    status: 'up',
    lastChecked: new Date().toISOString(),
    endpoints: [
      { id: 7, bankId: 4, serviceType: 'website', url: 'https://rcbc.com', status: 'up', lastChecked: new Date().toISOString() },
      { id: 8, bankId: 4, serviceType: 'internet_banking', url: 'https://online.rcbc.com', status: 'up', lastChecked: new Date().toISOString() }
    ]
  },
  {
    id: 5,
    slug: 'eastwest',
    name: 'EastWest Bank',
    status: 'up',
    lastChecked: new Date().toISOString(),
    endpoints: [
      { id: 9, bankId: 5, serviceType: 'website', url: 'https://eastwestbanker.com', status: 'up', lastChecked: new Date().toISOString() },
      { id: 10, bankId: 5, serviceType: 'internet_banking', url: 'https://online.eastwestbanker.com', status: 'up', lastChecked: new Date().toISOString() }
    ]
  }
]
