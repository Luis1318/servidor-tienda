const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./tienda.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        // Tabla de productos
        db.run(`CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            precio REAL,
            talla TEXT
        )`);

        // NUEVA: Tabla de usuarios para el Login
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE,
            password TEXT
        )`);
    }
});

// --- RUTAS DE PRODUCTOS ---
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/productos', (req, res) => {
    const { nombre, precio, talla } = req.body;
    if (!nombre || !precio || !talla) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }
    const query = `INSERT INTO productos (nombre, precio, talla) VALUES (?, ?, ?)`;
    db.run(query, [nombre, precio, talla], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "¡Producto registrado con éxito!", id: this.lastID });
    });
});

// --- RUTas DE AUTENTICACIÓN (LOGIN / REGISTRO) ---

// Registrar un nuevo usuario
app.post('/api/registro', (req, res) => {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
        return res.status(400).json({ error: "Faltan datos." });
    }
    const query = `INSERT INTO usuarios (usuario, password) VALUES (?, ?)`;
    db.run(query, [usuario, password], function(err) {
        if (err) {
            return res.status(400).json({ error: "El usuario ya existe o hubo un error." });
        }
        res.json({ message: "¡Usuario registrado con éxito!" });
    });
});

// Iniciar sesión
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    const query = `SELECT * FROM usuarios WHERE usuario = ? AND password = ?`;
    
    db.get(query, [usuario, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, message: "¡Bienvenido!" });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos." });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
