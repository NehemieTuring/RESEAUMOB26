import { Redirect, useLocalSearchParams } from 'expo-router';

/** Alias `/auth/login` → `/login`. */
export default function AuthPathAlias() {
    const { rest } = useLocalSearchParams<{ rest?: string | string[] }>();
    const parts = Array.isArray(rest) ? rest : rest ? [rest] : ['login'];
    return <Redirect href={`/${parts.join('/')}` as any} />;
}
