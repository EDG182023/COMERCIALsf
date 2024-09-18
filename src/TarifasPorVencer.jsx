import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  margin: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  color: #343a40;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #e9ecef;
  color: #000;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  color: #000;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

function TarifasPorVencer() {
  const [clientesVencidos, setClientesVencidos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTarifasPorVencer();
  }, []);

  const fetchTarifasPorVencer = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/tarifas-vencidas');
      console.log('Respuesta del servidor:', response.data);
      setClientesVencidos(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al obtener tarifas vencidas:', error);
      setError('Error al cargar los datos. Por favor, intente de nuevo más tarde.');
      setClientesVencidos([]);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      <Title>Clientes con Tarifas Vencidas</Title>
      {clientesVencidos.length === 0 ? (
        <p>No hay tarifas vencidas en este momento.</p>
      ) : (
        <Table>
          <thead>
            <Tr>
              <Th>ID Cliente</Th>
              <Th>Nombre del Cliente</Th>
              <Th>Ítem</Th>
              <Th>Precio</Th>
              <Th>Incremento</Th>
              <Th>Fecha de Vencimiento</Th>
            </Tr>
          </thead>
          <tbody>
            {clientesVencidos.map((cliente, index) => (
              <Tr key={index}>
                <Td>{cliente.id}</Td>
                <Td>{cliente.nombre}</Td>
                <Td>{cliente.item_nombre}</Td>
                <Td>${parseFloat(cliente.precio).toFixed(2)}</Td>
                <Td>{parseFloat(cliente.Incremento).toFixed(2)}%</Td>
                <Td>{new Date(cliente.fecha_vigencia_final).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default TarifasPorVencer;