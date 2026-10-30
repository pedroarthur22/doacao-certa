import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const mockShelters = [
  { id: '1', name: 'Abrigo Municipal Norte', need: 'Casacos de Inverno (Adulto)', urgency: 'Alta' },
  { id: '2', name: 'Casa de Acolhimento Esperança', need: 'Cobertores e Mantas', urgency: 'Urgente' },
  { id: '3', name: 'Centro Comunitário Vila Nova', need: 'Calçados e Tênis', urgency: 'Média' },
];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Abrigos com Campanhas Ativas</Text>
      
      <FlatList
        data={mockShelters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Details', { item })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>Principal Necessidade: {item.need}</Text>
            <Text style={styles.cardUrgency}>Urgência: {item.urgency}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>+ Cadastrar Oferta de Agasalho</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f172a' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#eff6ff', marginBottom: 15 },
  card: { backgroundColor: '#1e293b', padding: 15, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontSize: 18, color: '#60a5fa', fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, color: '#cbd5e1', marginTop: 4 },
  cardUrgency: { fontSize: 12, color: '#f87171', marginTop: 4, fontWeight: '600' },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});