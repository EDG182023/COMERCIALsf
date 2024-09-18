import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

const TarifasContainer = styled.div`
  margin-bottom: 2rem;
  color: #333; // Color de texto más oscuro
`;

const TarifasTitle = styled.h2`
  color: #0056b3; // Color más oscuro para el título
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  background-color: #0056b3; // Color más oscuro para los encabezados
  color: white;
  padding: 0.5rem;
  text-align: left;
`;

const Td = styled.td`
  border: 1px solid #ccc;
  padding: 0.5rem;
  color: #333; // Color más oscuro para el texto de las celdas
`;

const Button = styled.button`
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: white;
`;

const EditButton = styled(Button)`
  background-color: #fbc531;
`;

const DeleteButton = styled(Button)`
  background-color: #e84118;
`;

const AddButton = styled(Button)`
  background-color: #4cd137;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.25rem;
  box-sizing: border-box;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  margin-right: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 200px;
`;

const SearchIcon = styled.span`
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.25rem;
  box-sizing: border-box;
`;

const CancelButton = styled(Button)`
  background-color: #e74c3c;
  &:hover {
    background-color: #c0392b;
  }
`;

function Tarifas() {
  const [tarifas, setTarifas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTarifa, setNewTarifa] = useState({
    item_id: '',
    unidad_id: '',
    cliente_id: '',
    precio: '',
    fecha_vigencia_inicio: '',
    fecha_vigencia_final: '',
    Incremento: '' // Añadimos el campo Incremento
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [editingTarifa, setEditingTarifa] = useState(null);

  useEffect(() => {
    fetchTarifas();
    fetchItems();
    fetchUnidades();
    fetchClientes();
  }, []);

  const fetchTarifas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/tarifario');
      setTarifas(response.data);
    } catch (error) {
      console.error('Error al obtener tarifas:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error al obtener items:', error);
    }
  };

  const fetchUnidades = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/unidades');
      setUnidades(response.data);
    } catch (error) {
      console.error('Error al obtener unidades:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredTarifas = tarifas.filter(tarifa =>
    Object.values(tarifa).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAdd = async () => {
    try {
      const tarifaToAdd = {
        ...newTarifa,
        item_id: parseInt(newTarifa.item_id),
        unidad_id: parseInt(newTarifa.unidad_id),
        cliente_id: parseInt(newTarifa.cliente_id),
        precio: parseFloat(newTarifa.precio),
        Incremento: parseFloat(newTarifa.Incremento) // Convertimos Incremento a número
      };

      const response = await axios.post('http://127.0.0.1:5000/api/tarifario', tarifaToAdd);
      fetchTarifas();
      setNewTarifa({
        item_id: '',
        unidad_id: '',
        cliente_id: '',
        precio: '',
        fecha_vigencia_inicio: '',
        fecha_vigencia_final: '',
        Incremento: '' // Reseteamos Incremento
      });
      setShowAddForm(false);
      alert(response.data.message);
    } catch (error) {
      console.error('Error al agregar tarifa:', error.response?.data?.error || error.message);
      alert('Error al agregar tarifa: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (tarifa) => {
    setEditingId(tarifa.id);
    setEditingTarifa({...tarifa});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTarifa(null);
  };

  const handleSave = async () => {
    try {
      // Asegúrate de que todos los campos numéricos se envíen como números
      const tarifaToUpdate = {
        ...editingTarifa,
        item_id: parseInt(editingTarifa.item_id),
        unidad_id: parseInt(editingTarifa.unidad_id),
        cliente_id: parseInt(editingTarifa.cliente_id),
        precio: parseFloat(editingTarifa.precio),
        Incremento: parseFloat(editingTarifa.Incremento)
      };

      const response = await axios.put(`http://127.0.0.1:5000/api/tarifario/${editingTarifa.id}`, tarifaToUpdate);
      setEditingId(null);
      setEditingTarifa(null);
      fetchTarifas();
      alert(response.data.message);
    } catch (error) {
      console.error('Error al actualizar tarifa:', error.response?.data?.error || error.message);
      alert('Error al actualizar tarifa: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditChange = (field, value) => {
    setEditingTarifa({...editingTarifa, [field]: value});
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarifa?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/tarifario/${id}`);
        fetchTarifas();
      } catch (error) {
        console.error('Error al eliminar tarifa:', error);
      }
    }
  };

  return (
    <TarifasContainer>
      <TarifasTitle>Tarifas</TarifasTitle>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar tarifas..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
      </SearchContainer>
      <AddButton onClick={() => setShowAddForm(!showAddForm)}>
        {showAddForm ? 'Cancelar' : 'Agregar Tarifa'}
      </AddButton>
      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Item</Th>
            <Th>Categoría</Th>
            <Th>Unidad</Th>
            <Th>Cliente</Th>
            <Th>Precio</Th>
            <Th>Incremento</Th>
            <Th>Fecha Inicio</Th>
            <Th>Fecha Final</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {showAddForm && (
            <tr>
              <Td>Auto</Td>
              <Td>
                <Select value={newTarifa.item_id} onChange={(e) => setNewTarifa({...newTarifa, item_id: e.target.value})}>
                  <option value="">Seleccione un item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.nombre}</option>
                  ))}
                </Select>
              </Td>
              <Td>{items.find(item => item.id === parseInt(newTarifa.item_id))?.categoria || ''}</Td>
              <Td>
                <Select value={newTarifa.unidad_id} onChange={(e) => setNewTarifa({...newTarifa, unidad_id: e.target.value})}>
                  <option value="">Seleccione una unidad</option>
                  {unidades.map(unidad => (
                    <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                  ))}
                </Select>
              </Td>
              <Td>
                <Select value={newTarifa.cliente_id} onChange={(e) => setNewTarifa({...newTarifa, cliente_id: e.target.value})}>
                  <option value="">Seleccione un cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                  ))}
                </Select>
              </Td>
              <Td><Input type="number" value={newTarifa.precio} onChange={(e) => setNewTarifa({...newTarifa, precio: e.target.value})} /></Td>
              <Td><Input type="number" value={newTarifa.Incremento} onChange={(e) => setNewTarifa({...newTarifa, Incremento: e.target.value})} /></Td>
              <Td><Input type="date" value={newTarifa.fecha_vigencia_inicio} onChange={(e) => setNewTarifa({...newTarifa, fecha_vigencia_inicio: e.target.value})} /></Td>
              <Td><Input type="date" value={newTarifa.fecha_vigencia_final} onChange={(e) => setNewTarifa({...newTarifa, fecha_vigencia_final: e.target.value})} /></Td>
              <Td><AddButton onClick={handleAdd}>Agregar</AddButton></Td>
            </tr>
          )}
          {filteredTarifas.map((tarifa) => (
            <tr key={tarifa.id}>
              <Td>{tarifa.id}</Td>
              <Td>
                {editingId === tarifa.id ? (
                  <Select 
                    value={editingTarifa.item_id} 
                    onChange={(e) => handleEditChange('item_id', e.target.value)}
                  >
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </Select>
                ) : (
                  items.find(item => item.id === tarifa.item_id)?.nombre || tarifa.item_id
                )}
              </Td>
              <Td>{tarifa.item_categoria}</Td>
              <Td>
                {editingId === tarifa.id ? (
                  <Select 
                    value={editingTarifa.unidad_id} 
                    onChange={(e) => handleEditChange('unidad_id', e.target.value)}
                  >
                    {unidades.map(unidad => (
                      <option key={unidad.id} value={unidad.id}>{unidad.nombre}</option>
                    ))}
                  </Select>
                ) : (
                  unidades.find(unidad => unidad.id === tarifa.unidad_id)?.nombre || tarifa.unidad_id
                )}
              </Td>
              <Td>
                {editingId === tarifa.id ? (
                  <Select 
                    value={editingTarifa.cliente_id} 
                    onChange={(e) => handleEditChange('cliente_id', e.target.value)}
                  >
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                    ))}
                  </Select>
                ) : (
                  clientes.find(cliente => cliente.id === tarifa.cliente_id)?.nombre || tarifa.cliente_id
                )}
              </Td>
              <Td>
                {editingId === tarifa.id ? (
                  <Input 
                    value={editingTarifa.precio} 
                    onChange={(e) => handleEditChange('precio', e.target.value)} 
                  />
                ) : (
                  tarifa.precio
                )}
              </Td>
              <Td>
                {editingId === tarifa.id ? (
                  <Input 
                    value={editingTarifa.Incremento} 
                    onChange={(e) => handleEditChange('Incremento', e.target.value)} 
                  />
                ) : (
                  tarifa.Incremento
                )}
              </Td>
              <Td>
                {editingId === tarifa.id ? (
                  <Input 
                    type="date" 
                    value={editingTarifa.fecha_vigencia_inicio} 
                    onChange={(e) => handleEditChange('fecha_vigencia_inicio', e.target.value)} 
                  />
                ) : (
                  tarifa.fecha_vigencia_inicio
                )}
              </Td>
              <Td>
                {editingId === tarifa.id ? (
                  <Input 
                    type="date" 
                    value={editingTarifa.fecha_vigencia_final} 
                    onChange={(e) => handleEditChange('fecha_vigencia_final', e.target.value)} 
                  />
                ) : (
                  tarifa.fecha_vigencia_final
                )}
              </Td>
              <Td>
                {editingId === tarifa.id ? (
                  <>
                    <Button onClick={handleSave}>Guardar</Button>
                    <CancelButton onClick={handleCancelEdit}>Cancelar</CancelButton>
                  </>
                ) : (
                  <>
                    <EditButton onClick={() => handleEdit(tarifa)}>Editar</EditButton>
                    <DeleteButton onClick={() => handleDelete(tarifa.id)}>Eliminar</DeleteButton>
                  </>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TarifasContainer>
  );
}

export default Tarifas;