import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LogbookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao ClimbBeta!</Text>
      <Text>Aqui vai ficar a página de log.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});