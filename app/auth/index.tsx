import { Redirect } from 'expo-router';

export default function AuthIndexAlias() {
    return <Redirect href="/login" />;
}
