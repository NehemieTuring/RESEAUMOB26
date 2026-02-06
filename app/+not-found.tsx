/**
 * FleetMan Mobile - 404 Not Found Screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../src/constants/Colors';
import { Button } from '../src/components/Button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#09090b', '#0f172a', '#09090b']}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[Colors.primaryBlue, Colors.primaryCyan]}
              style={styles.iconGradient}
            >
              <Ionicons name="warning" size={48} color={Colors.white} />
            </LinearGradient>
          </View>

          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Page non trouvée</Text>
          <Text style={styles.subtitle}>
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </Text>

          <Link href="/" asChild>
            <Button
              title="Retour à l'accueil"
              onPress={() => { }}
              variant="primary"
              size="large"
              icon={<Ionicons name="home" size={20} color={Colors.white} />}
            />
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCode: {
    fontSize: 72,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: -2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
});
