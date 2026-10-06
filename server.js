const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

// Render asigna un puerto automáticamente, si no existe usa el 3000 localmente
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Servir archivos estáticos desde la raíz del proyecto (donde está tu index.html)
app.use(express.static(__dirname));

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./tienda.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            precio REAL,
            talla TEXT
        )`);
    }
});

// Ruta GET: Obtener todos los productos
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Ruta POST: Registrar un nuevo producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, talla } = req.body;

    if (!nombre || !precio || !talla) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const query = `INSERT INTO productos (nombre, precio, talla) VALUES (?, ?, ?)`;
    
    db.run(query, [nombre, precio, talla], function(err) {
        if (err) {
            console.error("Error al insertar en SQLite:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ 
            message: "¡Producto registrado con éxito!", 
            id: this.lastID 
        });
    });
});

// Encender servidor adaptado para la nube
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
