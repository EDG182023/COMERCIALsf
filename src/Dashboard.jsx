import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './AuthContext';
import Tarifas from './Tarifas';
import ActualizacionTarifas from './ActualizacionTarifas';
import TarifasPorVencer from './TarifasPorVencer';
import axios from 'axios';
import TarifasHistoricas from './TarifasHistoricas';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.nav`
  width: 250px;
  background: #1e272e;
  padding: 2rem 1rem;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 2rem;
  background: #f1f2f6;
`;

const NavItem = styled.div`
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  color: ${props => props.active ? '#00a8ff' : '#fff'};
  background: ${props => props.active ? 'rgba(0, 168, 255, 0.1)' : 'transparent'};
  border-radius: 5px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 168, 255, 0.1);
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2f3640;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background: #ff4757;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #ff6b81;
  }
`;

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tarifas');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [tarifas, setTarifas] = useState([]);

  const fetchTarifas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/tarifario');
      setTarifas(response.data);
    } catch (error) {
      console.error('Error al obtener tarifas:', error);
    }
  };

  useEffect(() => {
    const obtenerTarifas = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:5000/api/tarifario');
        setTarifas(respuesta.data);
      } catch (error) {
        console.error('Error al obtener tarifas:', error);
      }
    };

    obtenerTarifas();
  }, []);

  return (
    <DashboardContainer>
      <Sidebar>
        <NavItem active={activeTab === 'tarifas'} onClick={() => setActiveTab('tarifas')}>
          Tarifas
        </NavItem>
        <NavItem active={activeTab === 'tarifasPorVencer'} onClick={() => setActiveTab('tarifasPorVencer')}>
          Tarifas por Vencer
        </NavItem>
        <NavItem active={activeTab === 'actualizacionTarifas'} onClick={() => setActiveTab('actualizacionTarifas')}>
          Actualización de Tarifas
        </NavItem>
        <NavItem active={activeTab === 'tarifasHistoricas'} onClick={() => setActiveTab('tarifasHistoricas')}>
          Tarifas Históricas
        </NavItem>
      </Sidebar>
      <MainContent>
        
        <Header>
          <Title>Bienvenido, {user?.username}</Title>
          <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
        </Header>
        {activeTab === 'tarifas' && <Tarifas />}
        {activeTab === 'tarifasPorVencer' && <TarifasPorVencer />}
        {activeTab === 'actualizacionTarifas' && <ActualizacionTarifas />}
        {activeTab === 'tarifasHistoricas' && <TarifasHistoricas />}
      </MainContent>
    </DashboardContainer>
  );
}

export default Dashboard;