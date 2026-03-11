import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TOP_BOULDERS = [
  { id: '1', name: 'Crimson Roof',   color: '#E53935', difficulty: 'Hard',   reviews: 34 },
  { id: '2', name: 'Yellow Slab',    color: '#FDD835', difficulty: 'Easy',   reviews: 28 },
  { id: '3', name: 'Green Dyno',     color: '#43A047', difficulty: 'Medium', reviews: 21 },
  { id: '4', name: 'Red Arete',      color: '#E53935', difficulty: 'Hard',   reviews: 17 },
  { id: '5', name: 'Mellow Yellow',  color: '#FDD835', difficulty: 'Easy',   reviews: 15 },
];

const FOLLOWING_RECENT = [
  { id: '1', name: 'Sloper Wall',   color: '#43A047', difficulty: 'Medium', user: 'alex_climbs' },
  { id: '2', name: 'Pocket King',   color: '#E53935', difficulty: 'Hard',   user: 'sara_boulders' },
  { id: '3', name: 'Butter Feet',   color: '#FDD835', difficulty: 'Easy',   user: 'miguel_v4' },
  { id: '4', name: 'The Overhang',  color: '#E53935', difficulty: 'Hard',   user: 'alex_climbs' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* Welcome */}
      <Text style={styles.welcome}>Welcome back!</Text>
      <Text style={styles.subtitle}>Find your next challenge.</Text>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#9E9E9E" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search boulders..."
          placeholderTextColor="#9E9E9E"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Top Boulders */}
      <Text style={styles.sectionTitle}>Top Boulders</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRow}
      >
        {TOP_BOULDERS.map(b => (
          <TouchableOpacity key={b.id} style={styles.card}>
            <View style={[styles.cardImage, { backgroundColor: b.color + '33' }]}>
              <View style={[styles.colorBadge, { backgroundColor: b.color }]} />
            </View>
            <Text style={styles.cardName} numberOfLines={1}>{b.name}</Text>
            <Text style={styles.cardSub}>{b.difficulty}</Text>
            <View style={styles.cardStat}>
              <Ionicons name="star" size={11} color="#FDD835" />
              <Text style={styles.cardStatText}>{b.reviews} reviews</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Following recent */}
      <Text style={styles.sectionTitle}>Recently completed by people you follow</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRow}
      >
        {FOLLOWING_RECENT.map(b => (
          <TouchableOpacity key={b.id} style={styles.card}>
            <View style={[styles.cardImage, { backgroundColor: b.color + '33' }]}>
              <View style={[styles.colorBadge, { backgroundColor: b.color }]} />
            </View>
            <Text style={styles.cardName} numberOfLines={1}>{b.name}</Text>
            <Text style={styles.cardSub}>{b.difficulty}</Text>
            <View style={styles.cardStat}>
              <Ionicons name="person-outline" size={11} color="#9E9E9E" />
              <Text style={styles.cardStatText}>{b.user}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 4,
    marginBottom: 28,
  },
  card: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardImage: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  cardSub: {
    fontSize: 11,
    color: '#9E9E9E',
    paddingHorizontal: 10,
    marginTop: 2,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardStatText: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});
