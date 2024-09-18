import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Input, Button, Select, Space, Checkbox } from 'antd';
import moment from 'moment';
import axios from 'axios';


const { RangePicker } = DatePicker;
const { Option } = Select;

const TarifasHistoricas = () => {
  const [tarifas, setTarifas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    cliente: null,
    categoria: null,
    fechaInicio: null,
    fechaFin: null,
  });
  const [selectedColumns, setSelectedColumns] = useState(['id', 'cliente', 'categoria', 'precio']);

  const allColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Cliente', dataIndex: 'cliente', key: 'cliente' },
    { title: 'Categoría', dataIndex: 'categoria', key: 'categoria' },
    { title: 'Precio', dataIndex: 'precio', key: 'precio' },
    { title: 'Fecha de Vigencia', dataIndex: 'fecha_vigencia', key: 'fecha_vigencia' },
    { title: 'Usuario', dataIndex: 'usuario', key: 'usuario' },
    { title: 'Fecha de Movimiento', dataIndex: 'fecha_movimiento', key: 'fecha_movimiento' },
  ];

  const visibleColumns = allColumns.filter(col => selectedColumns.includes(col.dataIndex));

  useEffect(() => {
    cargarDatos();
    console.log('Tarifas cargadas:', tarifas);
  }, [tarifas]);

  const cargarDatos = async () => {
    try {
      const [tarifasRes, clientesRes, categoriasRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/tarifas_historicas'),
        axios.get('http://127.0.0.1:5000/api/clientes'),
        axios.get('http://127.0.0.1:5000/api/categorias')
      ]);

      setTarifas(tarifasRes.data);
      setClientes(clientesRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  };

  const handleFiltroChange = (valor, tipo) => {
    setFiltros(prevFiltros => ({ ...prevFiltros, [tipo]: valor }));
  };

  const handleFechaChange = (fechas) => {
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      fechaInicio: fechas ? fechas[0].format('YYYY-MM-DD') : null,
      fechaFin: fechas ? fechas[1].format('YYYY-MM-DD') : null,
    }));
  };

  const aplicarFiltros = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/tarifas_historicas', { params: filtros });
      setTarifas(response.data);
    } catch (error) {
      console.error('Error al aplicar los filtros:', error);
    }
  };

  return (
    <div>
      <h1>Tarifas Históricas</h1>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Seleccionar Cliente"
          onChange={(valor) => handleFiltroChange(valor, 'cliente')}
        >
          {clientes.map(cliente => (
            <Option key={cliente.id} value={cliente.id}>{cliente.nombre}</Option>
          ))}
        </Select>
        <Select
          style={{ width: 200 }}
          placeholder="Seleccionar Categoría"
          onChange={(valor) => handleFiltroChange(valor, 'categoria')}
        >
          {categorias.map(categoria => (
            <Option key={categoria.id} value={categoria.id}>{categoria.nombre}</Option>
          ))}
        </Select>
        <RangePicker onChange={handleFechaChange} />
        <Button type="primary" onClick={aplicarFiltros}>Aplicar Filtros</Button>
      </Space>
      <div style={{ marginBottom: 16 }}>
        <Checkbox.Group 
          options={allColumns.map(col => ({ label: col.title, value: col.dataIndex }))}
          value={selectedColumns}
          onChange={setSelectedColumns}
        />
      </div>
      <Table 
        columns={visibleColumns} 
        dataSource={tarifas}
        scroll={{ x: 'max-content' }}  // Permite desplazamiento horizontal
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default TarifasHistoricas;
