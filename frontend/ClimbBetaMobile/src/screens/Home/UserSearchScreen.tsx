import React from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_USERS = [
  { id: '1', name: 'Margarida Costa', username: '@mag_climbs', avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png', following: false },
  { id: '2', name: 'João Pedro', username: '@joaop_boulder', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', following: true },
];

export default function UserSearchScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Procurar escaladores..." autoFocus />
      </View>

      <ScrollView>
        <Text style={styles.title}>Sugestões para ti</Text>
        {MOCK_USERS.map(user => (
          <View key={user.id} style={styles.userCard}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.username}>{user.username}</Text>
            </View>
            <TouchableOpacity style={[styles.followBtn, user.following && styles.followingBtn]}>
              <Text style={[styles.followText, user.following && styles.followingText]}>
                {user.following ? 'A Seguir' : 'Seguir'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ccc', marginRight: 15 },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  username: { color: '#777' },
  followBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  followingBtn: { backgroundColor: '#e0e0e0' },
  followText: { color: '#fff', fontWeight: 'bold' },
  followingText: { color: '#333' }
});