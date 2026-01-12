const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.urlencoded({ extended: true }));

const db = mysql.createPool({
    host: '127.0.0.1', 
    user: 'u120456799_user', 
    password: 'Fisonia2026', // Pon aquí tu contraseña
    database: 'u120456799_fisonia',
    connectTimeout: 10000
});

// 1. Formulario con Fecha y Hora
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family:sans-serif; padding:20px;">
            <h1>Reserva tu Cita de Fisioterapia</h1>
            <form action="/enviar" method="POST">
                <label>Nombre:</label<br><input name="nombre" required><br><br>
                <label>WhatsApp:</label><br><input name="telefono" placeholder="Ej: 34600..." required><br><br>
                <label>Día de la cita:</label><br><input type="date" name="fecha_cita" required><br><br>
                <label>Hora de la cita:</label><br><input type="time" name="hora_cita" required><br><br>
                <button type="submit" style="background:#673ab7; color:white; padding:10px;">Reservar Ahora</button>
            </form>
        </body>
    `);
});

// 2. Guardar con los nuevos campos
app.post('/enviar', (req, res) => {
    const { nombre, telefono, fecha_cita, hora_cita } = req.body;
    const sql = 'INSERT INTO pacientes (nombre, telefono, fecha_cita, hora_cita) VALUES (?, ?, ?, ?)';
    
    db.execute(sql, [nombre, telefono, fecha_cita, hora_cita], (err) => {
        if (err) return res.send("Error: " + err.message);
        res.send("<h2>¡Cita agendada para el " + fecha_cita + " a las " + hora_cita + "!</h2><a href='/'>Volver</a>");
    });
});

// 3. Agenda actualizada
app.get('/agenda-2026', (req, res) => {
    db.execute('SELECT * FROM pacientes ORDER BY fecha_cita ASC, hora_cita ASC', (err, results) => {
        if (err) return res.send("Error.");
        let html = '<h1>Agenda de Citas</h1><table border="1" style="width:100%"><tr><th>Paciente</th><th>Día Cita</th><th>Hora</th><th>WhatsApp</th></tr>';
        results.forEach(p => {
            html += `<tr>
                <td>${p.nombre}</td>
                <td>${p.fecha_cita}</td>
                <td>${p.hora_cita}</td>
                <td><a href="https://wa.me/${p.telefono}">Contactar</a></td>
            </tr>`;
        });
        res.send(html + '</table>');
    });
});

app.listen(process.env.PORT || 3000);
