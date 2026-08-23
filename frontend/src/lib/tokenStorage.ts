import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'gps_access_token';
const REFRESH_TOKEN_KEY = 'gps_refresh_token';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveTokens({ accessToken, refreshToken }: TokenPair): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export function saveAccessToken(accessToken: string): Promise<void> {
  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export async function hasSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  return refreshToken !== null;
}
