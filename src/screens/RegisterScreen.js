import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [clothingType, setClothingType] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSave = () => {
    if (!clothingType || !quantity) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    Alert.alert('Sucesso', 'Oferta de agasalho registrada com sucesso!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Oferta de Vestuário</Text>

      <Text style={styles.label}>Tipo de Peça (ex: Casacos, Cobertores)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: Casacos de Frio" 
        placeholderTextColor="#93c5fd"
        value={clothingType}
        onChangeText={setClothingType}
      />

      <Text style={styles.label}>Quantidade Aproximada</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ex: 5 peças" 
        placeholderTextColor="#93c5fd"
        value={quantity}
        onChangeText={setQuantity}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Enviar Oferta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f172a' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#eff6ff', marginBottom: 20 },
  label: { color: '#cbd5e1', fontSize: 14, marginBottom: 5 },
  input: { backgroundColor: '#1e293b', color: '#eff6ff', padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});