/**
 * @file GymDetailsScreen.tsx
 * @description Ecrã de detalhe do ginásio com paredes, informação e navegação interna.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActiveBoulders, type Boulder } from '../../services/gymService';

const FALLBACK_BOULDER_IMG = 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=400&q=80';

/** Maps hold-color names (from the web dashboard swatch grid) to a hex, for a small swatch.
 *  Includes English (current palette) + legacy Portuguese names so older boulders still render. */
const HOLD_COLOR_HEX: Record<string, string> = {
  red: '#EF4444', orange: '#F97316', yellow: '#EAB308', green: '#22C55E',
  blue: '#3B82F6', purple: '#8B5CF6', pink: '#EC4899', black: '#111827',
  white: '#F3F4F6', grey: '#9CA3AF', gray: '#9CA3AF', brown: '#92400E', teal: '#14B8A6',
  vermelho: '#EF4444', azul: '#3B82F6', verde: '#22C55E',
  amarelo: '#EAB308', preto: '#111827', branco: '#F3F4F6',
};

/**
 * Detailed viewport for a specific commercial facility.
 *
 * Lists active in-house routes, technical setting allocations, and tracks catalog volume
 * updates while providing shortcuts to log newly cleared accents.
 */
export default function GymDetailsScreen({ route, navigation }: any) {
  const gymId: number = route.params?.gymId;
  const gymName = route.params?.gymName || 'Unknown Gym';

  const [boulders, setBoulders] = useState<Boulder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  /**
   * Requests active routes linked to the facility identifier.
   */
  const loadBoulders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await getActiveBoulders(gymId);
      setBoulders(data);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Could not load boulders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!gymId) {
      setErrorMsg('Invalid gym.');
      setIsLoading(false);
      return;
    }
    loadBoulders();
  }, [gymId]);

  /**
   * Pull-to-refresh: reloads the wall without the full-screen spinner, like the feed.
   */
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setErrorMsg(null);
      const data = await getActiveBoulders(gymId);
      setBoulders(data);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Could not load boulders.');
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Computes header text descriptions based on route metrics.
   */
  const subtitle = useMemo(() => {
    if (isLoading) return 'Loading catalog...';
    return `Route Catalog • ${boulders.length} Active Boulders`;
  }, [isLoading, boulders.length]);

  /** Distinct grades on this wall, sorted (V-grades numerically), for the difficulty filter. */
  const grades = useMemo(() => {
    const gradeValue = (g: string) => {
      const m = /^V(\d+)$/i.exec(g.trim());
      return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
    };
    return Array.from(new Set(boulders.map((b) => b.grade))).sort(
        (a, b) => gradeValue(a) - gradeValue(b) || a.localeCompare(b)
    );
  }, [boulders]);

  const visibleBoulders = selectedGrade ? boulders.filter((b) => b.grade === selectedGrade) : boulders;

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{gymName}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} tintColor="#2E7D32" />
            }
        >
          <Text style={styles.sectionTitle}>Active Boulders</Text>

          {!isLoading && !errorMsg && boulders.length > 0 && (
              <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterRow}
                  contentContainerStyle={styles.filterContent}
              >
                <TouchableOpacity
                    style={[styles.filterChip, selectedGrade === null && styles.filterChipActive]}
                    onPress={() => setSelectedGrade(null)}
                >
                  <Text style={[styles.filterChipText, selectedGrade === null && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                {grades.map((g) => (
                    <TouchableOpacity
                        key={g}
                        style={[styles.filterChip, selectedGrade === g && styles.filterChipActive]}
                        onPress={() => setSelectedGrade(g)}
                    >
                      <Text style={[styles.filterChipText, selectedGrade === g && styles.filterChipTextActive]}>{g}</Text>
                    </TouchableOpacity>
                ))}
              </ScrollView>
          )}

          {isLoading && (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.infoText}>Loading boulders...</Text>
              </View>
          )}

          {!isLoading && errorMsg && (
              <View style={styles.centerBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadBoulders}>
                  <Text style={styles.retryButtonText}>Try again</Text>
                </TouchableOpacity>
              </View>
          )}

          {!isLoading && !errorMsg && boulders.length === 0 && (
              <View style={styles.centerBox}>
                <Text style={styles.infoText}>No active boulders in this gym.</Text>
              </View>
          )}

          {!isLoading && !errorMsg && boulders.length > 0 && visibleBoulders.length === 0 && (
              <View style={styles.centerBox}>
                <Text style={styles.infoText}>No boulders for grade {selectedGrade}.</Text>
              </View>
          )}

          {!isLoading &&
              !errorMsg &&
              visibleBoulders.map((boulder) => (
                  <TouchableOpacity
                      key={boulder.id}
                      style={styles.boulderCard}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('BoulderDetails', { boulderId: boulder.id })}
                  >
                    <Image
                        source={{ uri: boulder.imageUrl || FALLBACK_BOULDER_IMG }}
                        style={styles.boulderThumb}
                        resizeMode="cover"
                    />

                    <View style={styles.boulderInfo}>
                      <View style={styles.gradeRow}>
                        <Text style={styles.gradeText}>{boulder.grade}</Text>
                        {/* Difficulty tag color */}
                        <View style={[styles.colorDot, { backgroundColor: boulder.hexColor || '#9E9E9E' }]} />
                      </View>
                      <View style={styles.holdsRow}>
                        {HOLD_COLOR_HEX[boulder.color.trim().toLowerCase()] && (
                            <View style={[styles.holdDot, { backgroundColor: HOLD_COLOR_HEX[boulder.color.trim().toLowerCase()] }]} />
                        )}
                        <Text style={styles.detailsText}>
                          Holds: {boulder.color} • Setter: {boulder.setterName || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                        style={styles.logButton}
                        onPress={() => {
                          navigation.navigate('LogAscent', {
                            boulderId: boulder.id,
                            boulderColor: boulder.color
                          });
                        }}
                    >
                      <Ionicons name="add-circle" size={20} color="#fff" />
                      <Text style={styles.logButtonText}>Log</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF3EC' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  content: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  filterRow: { marginBottom: 15 },
  filterContent: { gap: 8, paddingRight: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  filterChipText: { color: '#555', fontWeight: '600', fontSize: 13 },
  filterChipTextActive: { color: '#fff' },
  centerBox: { paddingVertical: 28, alignItems: 'center' },
  infoText: { marginTop: 10, color: '#666', fontSize: 15 },
  errorText: { color: '#B00020', fontSize: 15, textAlign: 'center', marginBottom: 10 },
  retryButton: { backgroundColor: '#2E7D32', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  boulderCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  boulderThumb: { width: 56, height: 56, borderRadius: 10, marginRight: 15, backgroundColor: '#e0e0e0' },
  boulderInfo: { flex: 1 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#ddd' },
  gradeText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  detailsText: { fontSize: 13, color: '#777', flexShrink: 1 },
  holdsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  holdDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  logButton: { flexDirection: 'row', backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', zIndex: 10 },
  logButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },
});