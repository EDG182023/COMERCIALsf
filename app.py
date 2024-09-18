from flask import Flask, jsonify, request, jsonify 
from flask_cors import CORS
import pyodbc
from datetime import datetime, timedelta
from decimal import Decimal
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": ["Content-Type", "Authorization"]}})

def get_db_connection():
    conn = pyodbc.connect('DRIVER={SQL Server};SERVER=tcp:192.168.1.10;DATABASE=GestionTarifas;UID=sa;PWD=ESA.2008')
    return conn

@app.route('/api/tarifario', methods=['GET'])
def get_tarifario():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('select t.*, i.categoria as item_categoria from tarifariogeneral_1 t left join item i on t.item_id = i.id')
    tarifariogeneral = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(tarifariogeneral)

@app.route('/api/items', methods=['GET'])
def get_items():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM item')
    items = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/unidades', methods=['GET'])
def get_unidades():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM unidades')
    unidades = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(unidades)

@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM cliente')
    clientes = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(clientes)


@app.route('/api/tarifario', methods=['POST'])
def add_tarifa():
    tarifa = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO tarifariogeneral_1 (item_id, unidad_id, cliente_id, precio, fecha_vigencia_inicio, fecha_vigencia_final, Incremento)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        ''', (tarifa['item_id'], tarifa['unidad_id'], tarifa['cliente_id'], tarifa['precio'], 
              tarifa['fecha_vigencia_inicio'], tarifa['fecha_vigencia_final'], tarifa['Incremento']))
        
        cursor.execute('SELECT SCOPE_IDENTITY() AS new_id;')
        new_id = cursor.fetchone().new_id
        conn.commit()
        return jsonify({'message': 'Tarifa añadida correctamente', 'id': new_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

@app.route('/api/tarifario/<int:id>', methods=['PUT'])
def update_tarifa(id):
    tarifa = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Primero, obtener la tarifa actual
        cursor.execute('SELECT * FROM tarifariogeneral_1 WHERE id = ?', (id,))
        tarifa_actual = cursor.fetchone()
        
        if not tarifa_actual:
            return jsonify({'error': 'Tarifa no encontrada'}), 404

        # Verificar si el campo 'usuario' está presente
        usuario = tarifa.get('usuario', 'usuario_default')

        # Insertar la tarifa actual en el histórico
        cursor.execute('''
            INSERT INTO tarifariogeneralhistorico 
            (id, item_id, unidad_id, cliente_id, precio, fecha_vigencia_inicio, fecha_vigencia_final, usuario, fecha_movimiento, accion, Incremento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (tarifa_actual.id, tarifa_actual.item_id, tarifa_actual.unidad_id, tarifa_actual.cliente_id, 
              tarifa_actual.precio, tarifa_actual.fecha_vigencia_inicio, tarifa_actual.fecha_vigencia_final, 
              usuario, datetime.now(), 1, tarifa_actual.Incremento))

        # Actualizar la tarifa en tarifariogeneral_1
        cursor.execute('''
            UPDATE tarifariogeneral_1
            SET precio = ?, fecha_vigencia_inicio = ?, fecha_vigencia_final = ?, Incremento = ?
            WHERE id = ?
        ''', (tarifa['precio'], tarifa['fecha_vigencia_inicio'], tarifa['fecha_vigencia_final'], tarifa['Incremento'], id))
        
        conn.commit()
        return jsonify({'message': 'Tarifa actualizada correctamente'}), 200
    except Exception as e:
        conn.rollback()
        print(f"Error al actualizar tarifa: {str(e)}")  # Agregar este print para debugging
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

@app.route('/api/tarifario/<int:id>', methods=['DELETE'])
def delete_tarifa(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tarifariogeneral_1 WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Tarifa eliminada correctamente'}), 200  


@app.route('/api/tarifario_historico', methods=['POST'])
def add_tarifa_historico():
    tarifa = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO TarifarioGeneralHistorico
            (id, item_id, unidad_id, cliente_id, precio, fecha_vigencia_inicio, fecha_vigencia_final, usuario, fecha_movimiento, accion, Incremento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (tarifa['id'], tarifa['item_id'], tarifa['unidad_id'], tarifa['cliente_id'], tarifa['precio'], 
              tarifa['fecha_vigencia_inicio'], tarifa['fecha_vigencia_final'], 
              tarifa['usuario'], tarifa['fecha_movimiento'], tarifa['accion'], tarifa['Incremento']))
        conn.commit()
        return jsonify({'message': 'Tarifa histórica añadida correctamente'}), 201
    except Exception as e:
        conn.rollback()
        print(f"Error al insertar tarifa histórica: {str(e)}")  # Añade esta línea para depuración
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()



@app.route('/api/items/crear', methods=['PUT'])
def add_item():
    item = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO item (nombre, categoria)
        VALUES (?, ?)
    ''', (item['nombre'], item['categoria']))
    conn.commit()
    conn.close()    
    return jsonify({'message': 'Item creado correctamente'}), 201

@app.route('/api/items/actualizar', methods=['PUT'])
def update_item():
    item = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE item
        SET nombre = ?, categoria = ?
        WHERE id = ?
    ''', (item['nombre'], item['categoria'], item['id']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item actualizado correctamente'}), 200

@app.route('/api/items/eliminar', methods=['DELETE'])
def delete_item():
    item = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM item WHERE id = ?', (item['id'],))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Item eliminado correctamente'}), 200

@app.route('/api/unidades/crear', methods=['PUT'])
def add_unidad():
    unidad = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO unidades (nombre)
        VALUES (?)
    ''', (unidad['nombre'],))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Unidad creada correctamente'}), 201

@app.route('/api/unidades/actualizar', methods=['PUT'])
def update_unidad():
    unidad = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE unidades
        SET nombre = ?
        WHERE id = ?
    ''', (unidad['nombre'], unidad['id']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Unidad actualizada correctamente'}), 200

@app.route('/api/unidades/eliminar', methods=['DELETE'])
def delete_unidad():
    unidad = request.json
    conn = get_db_connection()
    cursor = conn.cursor()  
    cursor.execute('DELETE FROM unidades WHERE id = ?', (unidad['id'],))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Unidad eliminada correctamente'}), 200

@app.route('/api/clientes/crear', methods=['PUT'])
def add_cliente():
    cliente = request.json
    conn = get_db_connection()  
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO cliente (id, nombre, email, acuerdo)
        VALUES (?, ?, ?, ? )
    ''', (cliente['id'], cliente['nombre'], cliente['email'], cliente['acuerdo']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Cliente creado correctamente'}), 201
    

@app.route('/api/categorias', methods=['GET'])
def get_categorias():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT categoria FROM item')
    categorias = [{"id": i, "nombre": row.categoria} for i, row in enumerate(cursor.fetchall(), start=1)]
    conn.close()
    return jsonify(categorias)

from datetime import datetime, timedelta



@app.route('/api/tarifas-vencidas', methods=['GET'])
def get_tarifas_vencidas():
    conn = get_db_connection()
    cursor = conn.cursor()
    today = datetime.now().date()
    end_of_month = (today.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    
    end_of_month_str = end_of_month.strftime('%Y-%m-%d')
    
    query = f'''
        SELECT DISTINCT 
            c.id, 
            c.nombre, 
            t.fecha_vigencia_final,
            i.nombre AS item_nombre,
            t.precio,
            t.Incremento
        FROM tarifariogeneral_1 t
        JOIN cliente c ON t.cliente_id = c.id
        JOIN item i ON t.item_id = i.id
        WHERE t.fecha_vigencia_final <= '{end_of_month_str}'
        ORDER BY c.nombre, t.fecha_vigencia_final
    '''
    
    cursor.execute(query)
    
    clientes_vencidos = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(clientes_vencidos)




@app.route('/api/actualizacion_masiva_tarifas', methods=['POST'])
def actualizacion_masiva_tarifas():
    datos = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        criterio = datos['criterio']
        seleccion_id = datos['seleccionId']
        incluir_cliente = datos['incluirCliente']
        cliente_id = datos['clienteId']
        fecha_inicio = datos['fechaInicio']
        fecha_fin = datos['fechaFin']
        porcentaje = Decimal(str(datos['porcentaje']))  # Convertir a Decimal
        usuario = datos['usuario']
        
        print(f"Criterio: {criterio}, Selección ID: {seleccion_id}")
        print(f"Incluir cliente: {incluir_cliente}, Cliente ID: {cliente_id}")
        print(f"Fechas: {fecha_inicio} - {fecha_fin}, Porcentaje: {porcentaje}")

        # Construir la consulta base
        query = '''
            SELECT t.* 
            FROM tarifariogeneral_1 t
            JOIN item i ON t.item_id = i.id
            WHERE 1=1
        '''
        params = []

        # Agregar condiciones según el criterio
        if criterio == 'cliente':
            query += ' AND t.cliente_id = ?'
            params.append(int(seleccion_id))
        elif criterio == 'item':
            query += ' AND t.item_id = ?'
            params.append(int(seleccion_id))
        elif criterio == 'unidad':
            query += ' AND t.unidad_id = ?'
            params.append(int(seleccion_id))
        elif criterio == 'categoria':
            query += ' AND i.categoria = ?'
            params.append(seleccion_id)

        if incluir_cliente:
            query += ' AND t.cliente_id = ?'
            params.append(int(cliente_id))

        print(f"Query: {query}")
        print(f"Params: {params}")

        # Obtener las tarifas afectadas
        cursor.execute(query, params)
        tarifas_afectadas = cursor.fetchall()

        print(f"Número de tarifas afectadas: {len(tarifas_afectadas)}")

        # Calcular el factor de aumento
        factor = Decimal('1') + (porcentaje / Decimal('100'))

        # Actualizar las tarifas
        for tarifa in tarifas_afectadas:
            # Insertar la tarifa actual en el histórico
            cursor.execute('''
                INSERT INTO tarifariogeneralhistorico 
                (id, item_id, unidad_id, cliente_id, precio, fecha_vigencia_inicio, fecha_vigencia_final, usuario, fecha_movimiento, accion, Incremento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 1, ?)
            ''', (tarifa.id, tarifa.item_id, tarifa.unidad_id, tarifa.cliente_id, 
                  tarifa.precio, tarifa.fecha_vigencia_inicio, tarifa.fecha_vigencia_final, 
                  usuario, tarifa.Incremento))

            # Actualizar la tarifa en tarifariogeneral_1
            nuevo_precio = Decimal(str(tarifa.precio)) * factor
            cursor.execute('''
                UPDATE tarifariogeneral_1
                SET precio = ?, fecha_vigencia_inicio = ?, fecha_vigencia_final = ?, Incremento = ?
                WHERE id = ?
            ''', (nuevo_precio, fecha_inicio, fecha_fin, porcentaje, tarifa.id))

        conn.commit()
        return jsonify({'message': f'Se actualizaron {len(tarifas_afectadas)} tarifas correctamente'}), 200
    except Exception as e:
        conn.rollback()
        print(f"Error al actualizar tarifas: {str(e)}")
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()

@app.route('/api/tarifas_historicas', methods=['GET'])
def get_tarifas_historicas():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tarifariogeneralhistorico')
    tarifas_historicas = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(tarifas_historicas)  
    
    



if __name__ == '__main__':
    app.run(debug=True)