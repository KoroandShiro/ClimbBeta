import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LogbookEntryScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Registo</Text>
      <Text style={{ marginBottom: 20 }}>Onde escalaste hoje?</Text>
      
      <Button title="🧗‍♂️ Ginásio (Indoor)" onPress={() => navigation.navigate('IndoorLog')} />
      <View style={{ height: 20 }} />
      <Button title="⛰️ Rocha (Outdoor)" onPress={() => navigation.navigate('OutdoorLog')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' }
});