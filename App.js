import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView, Modal, Platform } from 'react-native';

const API_URL = 'https://doacao-certa-production.up.railway.app';[cite: 10]

export default function App() {
  const [token, setToken] = useState(null);
  const [rotaAuth, setRotaAuth] = useState('login');
  const [abaAtiva, setAbaAtiva] = useState('inicio');
  
  // Auth states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // CRUD & Dados
  const [itens, setItens] = useState([]);
  const [stats, setStats] = useState({ usuarios: 0, totalItens: 0, disponiveis: 0, pendentes: 0 });

  // Estados para Pesquisa e Filtros no Catálogo
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');

  // Estado para o "Zoom" / Detalhe e Edição do Item
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Campos do Formulário / Edição
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [localRecolha, setLocalRecolha] = useState('');
  const [categoria, setCategoria] = useState('Vestuário');
  const [estadoConservacao, setEstadoConservacao] = useState('Bom');

  const mostrarAviso = (tituloAviso, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${tituloAviso}: ${mensagem}`);
    } else {
      Alert.alert(tituloAviso, mensagem);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUsuarioLogado(data.usuario);
        mostrarAviso('Bem-vindo!', `Olá, ${data.usuario.nome} (${data.usuario.tipo})`);
        buscarItens();
        if (data.usuario.tipo === 'admin') buscarStats(data.token);
      } else {
        mostrarAviso('Erro', data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      mostrarAviso('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  const handleRegister = async () => {
    try {
      const tipoUsuario = email.toLowerCase().includes('admin') ? 'admin' : 'comum';
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo: tipoUsuario })
      });
      const data = await response.json();
      if (response.ok) {
        mostrarAviso('Sucesso', `Conta criada como [${tipoUsuario}]! Faça login.`);
        setRotaAuth('login');
        setNome(''); setEmail(''); setSenha('');
      } else {
        mostrarAviso('Erro', data.error || 'Falha ao registar');
      }
    } catch (error) {
      mostrarAviso('Erro', 'Falha na conexão com o servidor.');
    }
  };

  const buscarItens = async () => {
    try {
      const response = await fetch(`${API_URL}/itens`);
      const data = await response.json();
      setItens(data);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  };

  const buscarStats = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      if (response.ok) setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleCadastrarItem = async () => {
    if (!titulo || !descricao || !tamanho || !localRecolha) {
      mostrarAviso('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/itens`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, descricao, tamanho, local_recolha: localRecolha, categoria, estado_conservacao: estadoConservacao })
      });
      const data = await response.json();
      if (response.ok) {
        mostrarAviso('Sucesso', data.message);
        setTitulo(''); setDescricao(''); setTamanho(''); setLocalRecolha('');
        setAbaAtiva('disponiveis');
        buscarItens();
      } else {
        mostrarAviso('Erro', data.error || 'Falha ao cadastrar');
      }
    } catch (error) {
      mostrarAviso('Erro', 'Falha na requisição.');
    }
  };

  const handleEditarItem = async () => {
    if (!titulo || !descricao || !tamanho || !localRecolha) {
      mostrarAviso('Atenção', 'Preencha todos os campos para atualizar.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/itens/${itemSelecionado.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, descricao, tamanho, local_recolha: localRecolha, categoria, estado_conservacao: estadoConservacao })
      });
      const data = await response.json();
      if (response.ok) {
        mostrarAviso('Sucesso', data.message || 'Item atualizado com sucesso!');
        setModoEdicao(false);
        setModalVisivel(false);
        buscarItens();
      } else {
        mostrarAviso('Erro', data.error || 'Falha ao atualizar item');
      }
    } catch (error) {
      mostrarAviso('Erro', 'Falha na requisição de edição.');
    }
  };

  const alterarStatusItem = async (id, novoStatus) => {
    try {
      const response = await fetch(`${API_URL}/itens/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });
      if (response.ok) {
        mostrarAviso('Sucesso', `Item atualizado para: ${novoStatus}`);
        setModalVisivel(false);
        buscarItens();
        if (usuarioLogado?.tipo === 'admin') buscarStats(token);
      }
    } catch (error) {
      mostrarAviso('Erro', 'Não foi possível alterar o status.');
    }
  };

  const executarExclusaoAPI = async (id) => {
    try {
      const response = await fetch(`${API_URL}/itens/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (response.ok) {
        mostrarAviso('Sucesso', data.message || 'Item removido com sucesso.');
        setModalVisivel(false);
        await buscarItens();
        if (usuarioLogado?.tipo === 'admin') buscarStats(token);
      } else {
        mostrarAviso('Erro ao Excluir', data.error || 'Acesso negado.');
      }
    } catch (error) {
      mostrarAviso('Erro', 'Falha de conexão com o servidor.');
    }
  };

  const handleExcluirItem = (id) => {
    if (Platform.OS === 'web') {
      const confirmou = window.confirm("VOCE TEM CERTEZA QUE DESEJA EXCLUIR ESSE ITEM ?");
      if (confirmou) executarExclusaoAPI(id);
    } else {
      Alert.alert(
        "Confirmação de Exclusão",
        "VOCE TEM CERTEZA QUE DESEJA EXCLUIR ESSE ITEM ?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, Excluir", style: "destructive", onPress: () => executarExclusaoAPI(id) }
        ]
      );
    }
  };

  const abrirDetalhesItem = (item) => {
    setItemSelecionado(item);
    setTitulo(item.titulo);
    setDescricao(item.descricao);
    setTamanho(item.tamanho);
    setLocalRecolha(item.local_recolha);
    setCategoria(item.categoria || 'Vestuário');
    setEstadoConservacao(item.estado_conservacao || 'Bom');
    setModoEdicao(false);
    setModalVisivel(true);
  };

  // Filtragem inteligente de itens para a aba de Doações
  const itensFiltrados = itens.filter(item => {
    const matchTermo = item.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                      item.descricao.toLowerCase().includes(termoPesquisa.toLowerCase());
    const matchCategoria = categoriaSelecionada === 'Todas' || item.categoria === categoriaSelecionada;
    return matchTermo && matchCategoria;
  });

  const categoriasDisponiveis = ['Todas', ...new Set(itens.map(i => i.categoria || 'Geral'))];

  useEffect(() => { buscarItens(); }, []);

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.authContainer}>
          <Text style={styles.appTitle}>Doação Certa 💚</Text>
          <Text style={styles.appSubtitle}>Plataforma Solidária e Sustentável</Text>

          <View style={styles.cardAuth}>
            <Text style={styles.headerAuth}>
              {rotaAuth === 'login' ? 'Entrar na sua Conta' : 'Criar Nova Conta (Digite "admin" no e-mail para Administrador)'}
            </Text>

            {rotaAuth === 'register' && (
              <TextInput style={styles.input} placeholder="Nome Completo" value={nome} onChangeText={setNome} />
            )}
            <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />

            {rotaAuth === 'login' ? (
              <>
                <TouchableOpacity style={styles.btnCoral} onPress={handleLogin}><Text style={styles.btnText}>Entrar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.switchLink} onPress={() => setRotaAuth('register')}><Text style={styles.linkText}>Não tem conta? Cadastre-se</Text></TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.btnGreen} onPress={handleRegister}><Text style={styles.btnText}>Registar Conta</Text></TouchableOpacity>
                <TouchableOpacity style={styles.switchLink} onPress={() => setRotaAuth('login')}><Text style={styles.linkText}>Já tem conta? Faça login</Text></TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <Text style={styles.navLogo}>Doação Certa</Text>
        <View style={styles.userInfoNav}>
          <Text style={styles.userBadge}>{usuarioLogado?.nome} [{usuarioLogado?.tipo}]</Text>
          <TouchableOpacity style={styles.btnLogout} onPress={() => { setToken(null); setUsuarioLogado(null); }}>
            <Text style={styles.btnLogoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabMenu}>
        <TouchableOpacity style={[styles.tabItem, abaAtiva === 'inicio' && styles.tabActive]} onPress={() => setAbaAtiva('inicio')}>
          <Text style={[styles.tabText, abaAtiva === 'inicio' && styles.tabTextActive]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, abaAtiva === 'disponiveis' && styles.tabActive]} onPress={() => setAbaAtiva('disponiveis')}>
          <Text style={[styles.tabText, abaAtiva === 'disponiveis' && styles.tabTextActive]}>Doações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, abaAtiva === 'cadastrar' && styles.tabActive]} onPress={() => { setAbaAtiva('cadastrar'); setTitulo(''); setDescricao(''); setTamanho(''); setLocalRecolha(''); }}>
          <Text style={[styles.tabText, abaAtiva === 'cadastrar' && styles.tabTextActive]}>Doar</Text>
        </TouchableOpacity>
        {usuarioLogado?.tipo === 'admin' && (
          <TouchableOpacity style={[styles.tabItem, abaAtiva === 'admin' && styles.tabActive]} onPress={() => { setAbaAtiva('admin'); buscarStats(token); }}>
            <Text style={[styles.tabText, abaAtiva === 'admin' && styles.tabTextActive]}>Painel Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        
        {abaAtiva === 'inicio' && (
          <View>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Olá, {usuarioLogado?.nome}!</Text>
              <Text style={styles.welcomeDesc}>Toque em qualquer item da lista para visualizar os detalhes ampliados e gerir as informações.</Text>
              <TouchableOpacity style={styles.btnCoralSmall} onPress={() => setAbaAtiva('cadastrar')}>
                <Text style={styles.btnTextSmall}>Fazer uma Doação Agora</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Destaques Disponíveis (Toque para Detalhes)</Text>
            {itens.filter(i => i.status === 'disponivel').slice(0, 3).map(item => (
              <TouchableOpacity key={item.id} style={styles.cardItem} onPress={() => abrirDetalhesItem(item)}>
                <View style={styles.badgeCategoria}><Text style={styles.badgeText}>{item.categoria}</Text></View>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardText} numberOfLines={2}>{item.descricao}</Text>
                <Text style={styles.cardInfo}>Tamanho: {item.tamanho} | Retirada: {item.local_recolha}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {abaAtiva === 'disponiveis' && (
          <View>
            <Text style={styles.sectionTitle}>Catálogo de Doações</Text>
            
            {/* Barra de Pesquisa */}
            <TextInput 
              style={styles.inputSearch} 
              placeholder="🔍 Pesquisar por título ou descrição..." 
              value={termoPesquisa}
              onChangeText={setTermoPesquisa}
            />

            {/* Filtros por Categoria */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              {categoriasDisponiveis.map((cat, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.filterChip, categoriaSelecionada === cat && styles.filterChipActive]}
                  onPress={() => setCategoriaSelecionada(cat)}
                >
                  <Text style={[styles.filterChipText, categoriaSelecionada === cat && styles.filterChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Listagem Filtrada */}
            {itensFiltrados.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum item encontrado com esses critérios.</Text>
            ) : (
              itensFiltrados.map(item => (
                <TouchableOpacity key={item.id} style={styles.cardItem} onPress={() => abrirDetalhesItem(item)}>
                  <View style={styles.rowBetween}>
                    <View style={styles.badgeCategoria}><Text style={styles.badgeText}>{item.categoria || 'Geral'}</Text></View>
                    <Text style={[styles.statusBadge, item.status === 'disponivel' ? styles.statusDisp : styles.statusPend]}>
                      Status: {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardText} numberOfLines={2}>{item.descricao}</Text>
                  <Text style={styles.cardInfo}>Tamanho: {item.tamanho} | Conservação: {item.estado_conservacao || 'Bom'}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {abaAtiva === 'cadastrar' && (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Cadastrar Nova Doação</Text>
            <TextInput style={styles.input} placeholder="Título (ex: Casaco de Inverno)" value={titulo} onChangeText={setTitulo} />
            <TextInput style={styles.input} placeholder="Descrição detalhada" value={descricao} onChangeText={setDescricao} />
            <TextInput style={styles.input} placeholder="Categoria (ex: Casacos, Calças, Infantil)" value={categoria} onChangeText={setCategoria} />
            <TextInput style={styles.input} placeholder="Tamanho (ex: P, M, G, 42)" value={tamanho} onChangeText={setTamanho} />
            <TextInput style={styles.input} placeholder="Estado de Conservação (ex: Novo, Ótimo, Bom)" value={estadoConservacao} onChangeText={setEstadoConservacao} />
            <TextInput style={styles.input} placeholder="Local de Retirada (ex: Bairro Centro, Rua X)" value={localRecolha} onChangeText={setLocalRecolha} />
            
            <TouchableOpacity style={styles.btnGreen} onPress={handleCadastrarItem}>
              <Text style={styles.btnText}>Enviar Doação para Análise</Text>
            </TouchableOpacity>
          </View>
        )}

        {abaAtiva === 'admin' && usuarioLogado?.tipo === 'admin' && (
          <View>
            <Text style={styles.sectionTitle}>Painel de Gestão (Admin)</Text>
            
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, {backgroundColor: '#e3f2fd'}]}>
                <Text style={styles.statNumber}>{stats.usuarios}</Text>
                <Text style={styles.statLabel}>Utilizadores</Text>
              </View>
              <View style={[styles.statBox, {backgroundColor: '#e8f5e9'}]}>
                <Text style={styles.statNumber}>{stats.totalItens}</Text>
                <Text style={styles.statLabel}>Total Doações</Text>
              </View>
              <View style={[styles.statBox, {backgroundColor: '#fff8e1'}]}>
                <Text style={styles.statNumber}>{stats.pendentes}</Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              <View style={[styles.statBox, {backgroundColor: '#ffebee'}]}>
                <Text style={styles.statNumber}>{stats.disponiveis}</Text>
                <Text style={styles.statLabel}>Disponíveis</Text>
              </View>
            </View>

            <Text style={styles.subSectionTitle}>Moderação de Doações Pendentes (Toque para Analisar)</Text>
            {itens.filter(i => i.status === 'pendente').length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma doação aguardando aprovação.</Text>
            ) : (
              itens.filter(i => i.status === 'pendente').map(item => (
                <TouchableOpacity key={item.id} style={styles.cardItem} onPress={() => abrirDetalhesItem(item)}>
                  <View style={styles.rowBetween}>
                    <View style={styles.badgeCategoria}><Text style={styles.badgeText}>{item.categoria}</Text></View>
                    <Text style={styles.statusPend}>AGUARDANDO APROVAÇÃO</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardText} numberOfLines={2}>{item.descricao}</Text>
                  <Text style={styles.cardInfo}>Tamanho: {item.tamanho} | Local: {item.local_recolha}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

      </ScrollView>

      {/* MODAL DE DETALHES / ZOOM E EDIÇÃO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {itemSelecionado && (
              <>
                {modoEdicao ? (
                  <ScrollView>
                    <Text style={styles.modalTitle}>Editar Doação</Text>
                    <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
                    <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
                    <TextInput style={styles.input} placeholder="Categoria" value={categoria} onChangeText={setCategoria} />
                    <TextInput style={styles.input} placeholder="Tamanho" value={tamanho} onChangeText={setTamanho} />
                    <TextInput style={styles.input} placeholder="Conservação" value={estadoConservacao} onChangeText={setEstadoConservacao} />
                    <TextInput style={styles.input} placeholder="Local de Retirada" value={localRecolha} onChangeText={setLocalRecolha} />

                    <View style={styles.modalAdminRow}>
                      <TouchableOpacity style={styles.btnGreen} onPress={handleEditarItem}>
                        <Text style={styles.btnActionText}>Salvar Alterações</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnSecondary} onPress={() => setModoEdicao(false)}>
                        <Text style={styles.btnActionText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                ) : (
                  <>
                    <View style={styles.rowBetween}>
                      <View style={styles.badgeCategoria}><Text style={styles.badgeText}>{itemSelecionado.categoria}</Text></View>
                      <Text style={[styles.statusBadge, itemSelecionado.status === 'disponivel' ? styles.statusDisp : styles.statusPend]}>
                        {itemSelecionado.status.toUpperCase()}
                      </Text>
                    </View>

                    <Text style={styles.modalTitle}>{itemSelecionado.titulo}</Text>
                    
                    <View style={styles.modalBodyBox}>
                      <Text style={styles.modalLabel}>Descrição Completa:</Text>
                      <Text style={styles.modalTextValue}>{itemSelecionado.descricao}</Text>

                      <Text style={styles.modalLabel}>Tamanho:</Text>
                      <Text style={styles.modalTextValue}>{itemSelecionado.tamanho}</Text>

                      <Text style={styles.modalLabel}>Estado de Conservação:</Text>
                      <Text style={styles.modalTextValue}>{itemSelecionado.estado_conservacao || 'Bom'}</Text>

                      <Text style={styles.modalLabel}>Local de Retirada:</Text>
                      <Text style={styles.modalTextValue}>{itemSelecionado.local_recolha}</Text>
                    </View>

                    {usuarioLogado?.tipo === 'admin' && (
                      <View style={styles.modalAdminRow}>
                        {itemSelecionado.status === 'pendente' && (
                          <TouchableOpacity style={styles.btnAprovar} onPress={() => alterarStatusItem(itemSelecionado.id, 'disponivel')}>
                            <Text style={styles.btnActionText}>Aprovar</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.btnEditar} onPress={() => setModoEdicao(true)}>
                          <Text style={styles.btnActionText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnExcluir} onPress={() => handleExcluirItem(itemSelecionado.id)}>
                          <Text style={styles.btnActionText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity style={styles.btnCloseModal} onPress={() => setModalVisivel(false)}>
                      <Text style={styles.btnCloseText}>Fechar Janela</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7f6' },
  authContainer: { flex: 1, padding: 20, maxWidth: 450, width: '100%', alignSelf: 'center', justifyContent: 'center' },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 5 },
  appSubtitle: { fontSize: 14, color: '#1565c0', textAlign: 'center', marginBottom: 25 },
  cardAuth: { backgroundColor: '#ffffff', padding: 25, borderRadius: 12, elevation: 4 },
  headerAuth: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 },
  inputSearch: { backgroundColor: '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 12, fontSize: 14 },
  
  filterContainer: { flexDirection: 'row', marginBottom: 15, maxHeight: 40 },
  filterChip: { backgroundColor: '#e0e0e0', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, justifyContent: 'center', height: 32 },
  filterChipActive: { backgroundColor: '#2e7d32' },
  filterChipText: { color: '#333', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#fff', fontWeight: 'bold' },

  btnCoral: { backgroundColor: '#ff6b6b', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnGreen: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnCoralSmall: { backgroundColor: '#ff6b6b', padding: 10, borderRadius: 6, alignSelf: 'flex-start', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnTextSmall: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  switchLink: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#1565c0', fontSize: 14, fontWeight: '500' },

  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2e7d32', padding: 15 },
  navLogo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userInfoNav: { flexDirection: 'row', alignItems: 'center' },
  userBadge: { color: '#fff', marginRight: 10, fontSize: 13, fontWeight: '600' },
  btnLogout: { backgroundColor: '#c62828', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4 },
  btnLogoutText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  tabMenu: { flexDirection: 'row', backgroundColor: '#ffffff', elevation: 2 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#ff6b6b', backgroundColor: '#fafafa' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#ff6b6b', fontWeight: 'bold' },

  mainContent: { padding: 20, maxWidth: 700, width: '100%', alignSelf: 'center' },
  welcomeCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2, borderLeftWidth: 5, borderLeftColor: '#2e7d32' },
  welcomeTitle: { fontSize: 20, fontWeight: 'bold', color: '#2e7d32', marginBottom: 8 },
  welcomeDesc: { fontSize: 14, color: '#555', lineHeight: 20 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
  subSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 10, marginTop: 20 },
  
  cardItem: { backgroundColor: '#ffffff', padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeCategoria: { backgroundColor: '#e3f2fd', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 4 },
  badgeText: { color: '#1565c0', fontSize: 11, fontWeight: 'bold' },
  statusBadge: { fontSize: 11, fontWeight: 'bold' },
  statusDisp: { color: '#2e7d32' },
  statusPend: { color: '#f57c00' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  cardText: { fontSize: 14, color: '#555', marginBottom: 6 },
  cardInfo: { fontSize: 12, color: '#777' },

  formCard: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, elevation: 2 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  statBox: { width: '48%', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10, elevation: 1 },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },

  btnAprovar: { backgroundColor: '#2e7d32', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 5 },
  btnEditar: { backgroundColor: '#1565c0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 5 },
  btnExcluir: { backgroundColor: '#c62828', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  btnSecondary: { backgroundColor: '#666', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginTop: 5, alignItems: 'center' },
  btnActionText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#777', fontStyle: 'italic', marginVertical: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', width: '100%', maxWidth: 500, maxHeight: '90%', padding: 25, borderRadius: 14, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginVertical: 12 },
  modalBodyBox: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  modalLabel: { fontSize: 12, fontWeight: 'bold', color: '#888', marginTop: 8 },
  modalTextValue: { fontSize: 15, color: '#333', marginBottom: 4 },
  modalAdminRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  btnCloseModal: { backgroundColor: '#666', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnCloseText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});