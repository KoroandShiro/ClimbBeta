import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function OutdoorLogScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registo em Rocha ⛰️</Text>
      
      <Text style={styles.label}>Localização / Setor</Text>
      <TextInput style={styles.input} placeholder="Ex: Sintra, Peninha..." />

      <Text style={styles.label}>Nome do Boulder (se tiver)</Text>
      <TextInput style={styles.input} placeholder="Ex: O Grande Teto..." />

      <Text style={styles.label}>Grau (Escala Fontainebleau / V)</Text>
      <TextInput style={styles.input} placeholder="Ex: 7a, V6..." />

      <Text style={styles.label}>Tentativas</Text>
      <TextInput style={styles.input} placeholder="Ex: 5" keyboardType="numeric" />

      <View style={styles.buttonContainer}>
        <Button title="📸 Add Rock Photo" color="#757575" onPress={() => alert('Would open gallery!')} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Log Outdoor Ascent" color="#2E7D32" onPress={() => {
          alert('Good job logging that outdoor ascent! 🌄');
          navigation.navigate('Profile'); // Ou para onde quiseres
        }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5, color: '#555' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  buttonContainer: { marginTop: 20 }
});