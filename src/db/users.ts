export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  docType?: string;
  docNumber?: string;
  birthDate?: string;
  avatarUrl?: string;
  photoUrl?: string;
  role: 'customer' | 'admin' | 'staff';
  emailVerified?: boolean;
  isAdmin?: boolean;
  marketingAccepted?: boolean;
  termsAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

const usersStore = new Map<string, UserProfile>();

// List of recognized admin email addresses
const ADMIN_EMAILS = [
  'buchisapaweb@gmail.com',
  'admin@buchisapa.pe',
  'nexaltustecsac@gmail.com'
];

// Seed default users (Admin + Sample Customer)
const defaultAdmin: UserProfile = {
  id: '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91',
  uid: '9b1fabb3-25d9-4c0a-921a-8d5a460e8a91',
  email: 'admin@buchisapa.pe',
  name: 'Administrador Buchisapa',
  firstName: 'Admin',
  lastName: 'Buchisapa',
  phone: '943 312 024',
  docType: 'DNI',
  docNumber: '72345678',
  role: 'admin',
  isAdmin: true,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
usersStore.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
usersStore.set(defaultAdmin.uid, defaultAdmin);

const adminWebUser: UserProfile = {
  id: '166099db-28ad-4329-b3c4-117f63188472',
  uid: '166099db-28ad-4329-b3c4-117f63188472',
  email: 'buchisapaweb@gmail.com',
  name: 'Administrador BuchiSapa',
  firstName: 'Administrador',
  lastName: 'BuchiSapa',
  phone: '942 475 459',
  docType: 'DNI',
  docNumber: '70000001',
  role: 'admin',
  isAdmin: true,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
usersStore.set(adminWebUser.email.toLowerCase(), adminWebUser);
usersStore.set(adminWebUser.uid, adminWebUser);
usersStore.set('admin-buchisapaweb-id', adminWebUser);

const defaultCustomer: UserProfile = {
  id: 'cust-buchisapa-1',
  uid: 'cust-buchisapa-1',
  email: 'cliente@buchisapa.pe',
  name: 'Cliente Buchisapa',
  firstName: 'Cliente',
  lastName: 'Buchisapa',
  phone: '987 654 321',
  docType: 'DNI',
  docNumber: '45678901',
  role: 'customer',
  isAdmin: false,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
usersStore.set(defaultCustomer.email.toLowerCase(), defaultCustomer);

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  if (!email) return null;
  return usersStore.get(email.toLowerCase().trim()) || null;
}

export async function getUserByUid(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  for (const user of usersStore.values()) {
    if (user.uid === uid || user.id === uid) return user;
  }
  return null;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  return Array.from(usersStore.values());
}

export async function registerCustomer(data: any): Promise<UserProfile> {
  const email = (data.email || '').toLowerCase().trim();
  const existing = await getUserByEmail(email);

  const isAdminUser = data.role === 'admin' || ADMIN_EMAILS.includes(email);

  if (existing) {
    const updated: UserProfile = {
      ...existing,
      ...data,
      name: data.name || `${data.firstName || existing.firstName || ''} ${data.lastName || existing.lastName || ''}`.trim() || existing.name,
      role: isAdminUser ? 'admin' : (existing.role || 'customer'),
      isAdmin: isAdminUser || Boolean(existing.isAdmin),
      updatedAt: new Date().toISOString()
    };
    usersStore.set(email, updated);
    return updated;
  }

  const id = data.uid || data.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || email.split('@')[0];
  const userRole = isAdminUser ? 'admin' : (data.role || 'customer');
  const newUser: UserProfile = {
    id,
    uid: id,
    email,
    name,
    firstName: data.firstName || name.split(' ')[0],
    lastName: data.lastName || name.split(' ').slice(1).join(' '),
    phone: data.phone || '',
    docType: data.docType || 'DNI',
    docNumber: data.docNumber || '',
    birthDate: data.birthDate || '',
    avatarUrl: data.avatarUrl || data.photoUrl || '',
    photoUrl: data.photoUrl || data.avatarUrl || '',
    role: userRole,
    isAdmin: isAdminUser,
    emailVerified: Boolean(data.emailVerified),
    marketingAccepted: Boolean(data.marketingAccepted),
    termsAccepted: data.termsAccepted !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  usersStore.set(email, newUser);
  return newUser;
}

export async function googleAuthCustomer(data: any): Promise<UserProfile> {
  const email = (data.email || '').toLowerCase().trim();
  const existing = await getUserByEmail(email);
  if (existing) {
    existing.photoUrl = data.photoUrl || existing.photoUrl;
    existing.avatarUrl = data.photoUrl || existing.avatarUrl;
    if (data.name) existing.name = data.name;
    existing.emailVerified = true;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }

  return registerCustomer({
    ...data,
    email,
    uid: data.googleUid || `goog_${Date.now()}`,
    emailVerified: true
  });
}

export async function getOrCreateUser(uid: string, email: string, name?: string, photoUrl?: string): Promise<UserProfile> {
  const byUid = await getUserByUid(uid);
  if (byUid) return byUid;

  const byEmail = await getUserByEmail(email);
  if (byEmail) {
    byEmail.uid = uid;
    return byEmail;
  }

  return registerCustomer({
    uid,
    id: uid,
    email,
    name: name || email.split('@')[0],
    photoUrl: photoUrl || '',
    avatarUrl: photoUrl || '',
    emailVerified: true
  });
}
