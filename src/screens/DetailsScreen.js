import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function DetailsScreen({ route, navigation }) {
  const { item } = route.params || { item: { name: 'Abrigo Exemplo', need: 'N/A', urgency: 'N/A' } };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      
      <View style={styles.detailBox}>
        <Text style={styles.label}>Item Mais Necessitado:</Text>
        <Text style={styles.value}>{item.need}</Text>

        <Text style={styles.label}>Nível de Urgência:</Text>
        <Text style={styles.value}>{item.urgency}</Text>

        <Text style={styles.label}>Instruções para Entrega:</Text>
        <Text style={styles.value}>
          As peças devem estar limpas e em boas condições de uso. Entregas aceitas na portaria principal 24 horas por dia.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f172a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#60a5fa', marginBottom: 20 },
  detailBox: { backgroundColor: '#1e293b', padding: 15, borderRadius: 8, marginBottom: 20 },
  label: { color: '#cbd5e1', fontSize: 14, marginTop: 10, fontWeight: 'bold' },
  value: { color: '#eff6ff', fontSize: 16, marginTop: 2 },
  button: { backgroundColor: '#334155', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#eff6ff', fontWeight: 'bold' }
});