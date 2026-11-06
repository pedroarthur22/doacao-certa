import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';

export default function App() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarItens = async () => {
    try {
      const response = await fetch('http://localhost:3000/itens');
      const data = await response.json();
      setItens(data);
    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarItens();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Doação Certa - Itens Disponíveis</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={itens}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.texto}>{item.descricao}</Text>
                <Text style={styles.texto}>Tamanho: {item.tamanho}</Text>
                <Text style={styles.texto}>Local: {item.local_recolha}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#111' },
  texto: { fontSize: 14, color: '#555', marginBottom: 3 }
});