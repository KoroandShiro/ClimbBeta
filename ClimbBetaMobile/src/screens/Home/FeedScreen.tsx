import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dados falsos (Mock Data) para gerar o Feed
const FEED_POSTS = [
  {
    id: '1',
    user: { name: 'Rúben Duarte', username: '@ruben_d', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    location: 'Vertical Wall',
    time: 'Há 2 horas',
    route: 'Vermelho Inclinado',
    grade: 'V4',
    style: 'Flash',
    notes: 'Aquela presa no final escorregou um bocado, mas deu para segurar! 💪',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80',
    likes: 12,
  },
  {
    id: '2',
    user: { name: 'Ana Silva', username: '@anaclimbs', avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' },
    location: 'Sintra (Outdoor)',
    time: 'Ontem',
    route: 'O Grande Teto',
    grade: '7a',
    style: '3 Tentativas',
    notes: 'Finalmente encadeei o meu projeto! A rocha estava perfeita hoje. 🧗‍♀️',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80',
    likes: 34,
  }
];

export default function FeedScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      
      {/* Cabeçalho da App (Feed) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ClimbBeta</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Lupa para pesquisar utilizadores */}
          <TouchableOpacity onPress={() => navigation.navigate('UserSearch')} style={{ marginRight: 15 }}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Publicações */}
      {FEED_POSTS.map((post) => (
        <View key={post.id} style={styles.postCard}>
          
          {/* 1. Info do Utilizador */}
          <View style={styles.postHeader}>
            <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.user.name}</Text>
              <Text style={styles.postTime}>{post.location} • {post.time}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#777" />
            </TouchableOpacity>
          </View>

          {/* 2. Info da Subida (Grau e Estilo) */}
          <View style={styles.ascentInfo}>
            <Text style={styles.routeText}>
              <Text style={{ fontWeight: 'bold' }}>{post.route}</Text> ({post.grade})
            </Text>
            <View style={styles.styleChip}>
              <Text style={styles.styleText}>{post.style}</Text>
            </View>
          </View>

          {/* 3. Notas / Descrição */}
          <Text style={styles.notes}>{post.notes}</Text>

          {/* 4. Imagem / Vídeo do Beta */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AscentDetails')}>
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          </TouchableOpacity>

          {/* 5. Barra de Interação (Likes/Comments) */}
          <View style={styles.interactionBar}>
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="heart-outline" size={24} color="#333" />
              <Text style={styles.interactionText}>{post.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#333" />
              <Text style={styles.interactionText}>Comentar</Text>
            </TouchableOpacity>
          </View>

        </View>
      ))}
      
      {/* Espaço extra no fundo para não colar na Tab Bar */}
      <View style={{ height: 20 }} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#2E7D32', fontStyle: 'italic' },
  
  postCard: { backgroundColor: '#fff', marginTop: 10, paddingVertical: 15 },
  
  postHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  postTime: { fontSize: 12, color: '#777', marginTop: 2 },
  
  ascentInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 8 },
  routeText: { fontSize: 16, color: '#333', flex: 1 },
  styleChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  styleText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  
  notes: { paddingHorizontal: 15, fontSize: 14, color: '#444', marginBottom: 12, lineHeight: 20 },
  
  postImage: { width: '100%', height: 350, backgroundColor: '#e0e0e0' },
  
  interactionBar: { flexDirection: 'row', paddingHorizontal: 15, paddingTop: 12, marginTop: 5 },
  interactionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  interactionText: { marginLeft: 6, fontSize: 14, color: '#555', fontWeight: '500' },
});