// -------------------------------|
// Importaciones de módulos base  |
// -------------------------------|
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Role from './models/modelRol.js';
import bcrypt from 'bcrypt';
import Vendedor from './models/modelVendedor.js'; //
import { v4 as uuidv4 } from 'uuid';

// -------------------------------
// Configuración del entorno
// -------------------------------
import { PORT, SECRET_JWT_KEY, EMAIL_PASS, EMAIL_USER } from "./config.js";

// -----------------------------|
// Base de datos y modelos		|
// -----------------------------
import conectaDB from "./db/bd.js";
import User from "./models/modelUser.js"; // Ajusta la ruta según tu proyecto

// -------------------------------
//	Conexcion a Api de FastAPI
// -------------------------------
const API_BASE = 'https://ventasapiapp-production.up.railway.app/api/v1'; // base de tu FastAPI

// -------------------------------
// Middlewares y repositorios
// -------------------------------
import { verifyAdmin } from "./middlewares/auth.js";
import { subirArchivos } from "./middlewares/subirDatos.js";
import { UserRepository } from "./repositories/user-repository.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function conexion() {
	await conectaDB();
}

conexion();

const app = express()
app.use(express.static(path.join(__dirname, "public")));
app.use("/image", express.static(path.join(__dirname, "image")));

//app.use('/image', express.static('image'));
app.set('view engine', 'ejs')
app.set("views", path.join(__dirname, "views"));
app.use(express.json())

app.use(cookieParser()); // primero se carga cookieParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para extraer el usuario desde la cookie JWT
app.use((req, res, next) => {
	const token = req.cookies.access_token;
	// Inicializamos user en null
	req.user = null;
	if (token) {
		try {
			// Decodificamos el token
			const decoded = jwt.verify(token, SECRET_JWT_KEY);
			req.user = decoded; // guardamos la info del usuario en req.user
		} catch (err) {
			console.warn("Token inválido:", err.message);
		}
	}
	// Hacemos disponible `user` en todas las vistas EJS
	res.locals.user = req.user;
	next(); // seguimos con la siguiente ruta o middleware
});

// Middleware para desactivar caché
app.use((req, res, next) => {
	res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
	next();
});


app.get('/', (req, res) => {
	res.render('home')
})

app.get("/contacto", function (req, res) {// esta en la ruta para la view de contacto
	res.render("contacto")
})

app.get("/registro_vendedor", function (req, res) {
    res.render("registro_vendedor"); 
});

app.get("/menu_principal", function (req, res) {
  if (!req.user) return res.redirect('/login');
  res.render('menuPrincipal', { user: req.user });
});

app.get("/showUser", verifyAdmin, async (req, res) => {
	const users = await UserRepository.mostrarContactos();
	if (!users.role) {
   		users.role = { rol: 'user', descripcion: 'Sin rol asignado' };
	}
	res.render("showUser", { users }); // <--- pasa el user aquí
});

app.get('/login', async (req, res) => {
	res.render('login', { showRegister: false, username: undefined })
})
app.get('/forgot-password', async (req, res) => {
    res.render('forgot-password', {})
})

app.get('/ajustes_usuario', async (req, res) => {
    res.render('ajustes_usuario', {})
})

app.get('/register', (req, res) => {
	res.render('login', { showRegister: true, username: undefined });
});

app.get('/perfil', async (req, res) => {
	if (!req.user) return res.status(403).send('Acces not authorized');
	// Obtener usuario completo con rol
	const user = await User.findById(req.user.id).populate('role'); // role será objeto completo

	res.render('perfil', { user })
})

app.get('/rutas', async (req, res) => {
	if (!req.user) return res.status(403).send('Acces not authorized');
	// Obtener usuario completo con rol
	const user = await User.findById(req.user.id).populate('role'); // role será objeto completo

	res.render('rutas', { user })
})
app.get("/perfil", async (req, res) => {
    if (!req.user) return res.redirect("/login");

    console.log("Token decodificado:", req.user);
    const usuarioDB = await User.findById(req.user.id);  // <<--- AQUÍ LO TRAES COMPLETO
    console.log("Usuario real desde MongoDB:", usuarioDB);

    res.render("perfil", {
        user: usuarioDB
    });
});


app.post("/SolicitarDatos", subirArchivos(), async (req, res) => {
    if (!req.user) return res.status(403).send("Access not authorized");

    try {
        const userId = req.user.id; // El ID viene del token

        const nombre = req.body.nombre;
        const edad = req.body.edad;
        const telefono = req.body.telefono;

        const photo = req.file ? req.file.filename : null;

        const updateData = {
            nombre,
            edad,
            telefono
        };

        if (photo) {
            updateData.photoPerfil = photo;
        }

        // Actualizar usuario
        await User.findByIdAndUpdate(userId, updateData);

        // Traer usuario actualizado
        const usuarioActualizado = await User.findById(userId);

        console.log("Usuario REAL actualizado desde MongoDB:");
        console.log(usuarioActualizado);

        // Enviar a la vista
        res.render("perfil", { user: usuarioActualizado });

    } catch (error) {
        console.error("Error al actualizar datos", error);
        res.status(500).send("Error interno");
    }
});

app.get("/datosUsuario", async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }

        const usuarioBD = await User.findById(req.user.id);

        res.render("datosUsuario", { user: usuarioBD });
    } catch (err) {
        console.log(err);
        res.send("Error cargando datos");
    }
});
app.use('/uploads', express.static('uploads'));

app.get('/rutas', async (req, res) => {
	if (!req.user) return res.status(403).send('Acces not authorized');
	// Obtener usuario completo con rol
	const user = await User.findById(req.user.id).populate('role'); // role será objeto completo

	res.render('rutas', { user });
});


app.post('/login', async (req, res) => {
	const { username, password } = req.body
	try {
		const user = await UserRepository.login({ username, password })

		const token = jwt.sign(
			{ id: user._id, username: user.username, role: user.role.rol },
			SECRET_JWT_KEY,
			{ expiresIn: '1h' }
		)

		//en local storage o cookies: una cookie tiene un poquito mas seguridad y es vulnerable a un script 
		// pero tienene un caopa de sefuridad httpoli y no puede hacceder javascript y es algo mas de 
		// seguridad y expiran a diferencia de localstorage
		res
			.cookie('access_token', token, {
				httpOnly: true,// la cookie solo se puede acceder en el servidor Y NO SE VERA DESDE JAVASCRIPT
				secure: process.env.NODE_ENV == 'production',//la cookie solo se puede acceder en https
				sameSite: 'strict',// la cookie solo se puede acceder en el mismo dominio
				maxAge: 1000 * 60 * 60, // solo tiene validez una hora la cookie,
			}).send({ user, token })
		console.log("YA FUE VERIFICADO")
		console.log(user.role);
	} catch (error) {
		res.status(401).send(error.message)
	}
})

app.post('/register', async (req, res) => {
	const { username, email, password } = req.body;
	try {

		// Generar token de verificación
		const verificationToken = crypto.randomBytes(32).toString("hex");
		//primero se genera el token para luego enviarle el token como parametro al crear el usuario

		const id = await UserRepository.create({ username, email, password, verificationToken });
		// Configurar nodemailer
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASS,
			},
		})

		const verificationLink = `http://localhost:3000/verify?token=${verificationToken}`;

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Confirma tu cuenta",
			html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
					
					<img src="https://i.postimg.cc/t4BLGm5m/logo-blanco.png" 
						alt="Logo" 
						style="width: 120px; margin-bottom: 20px;" />
					<h2 style="color: #28a745;">¡Haz clic para confirmar tu cuenta!</h2>
					<p>Hola <strong>${username}</strong>, gracias por registrarte. Para activar tu cuenta, haz clic en el botón de abajo:</p>
					
					<a href="${verificationLink}" 
						style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px;">
						Confirmar Cuenta
					</a>
					
					<p style="font-size: 0.9rem; color: #555;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
					</div>
				`
		};


		await transporter.sendMail(mailOptions);
		res.send("Registro exitoso. Revisa tu correo para confirmar la cuenta.");

		// Después de registrar, puedes redirigir al login o mostrar mensaje
		//res.redirect('/login'); // aquí vas al login
	} catch (error) {
		console.error("Error en registro:", error.message);
		res.status(400).json({ error: "Error al registrar usuario" });
	}
});


app.post('/logout', (req, res) => {
	res
		.clearCookie('access_token')
		.json({ message: 'Logout successful' })
	// puedo redireccionara cualquier ruta o a donde quiera lo importante es que limpie la cookie
})

app.get('/protected', (req, res) => {
	if (!req.user) return res.status(403).send('Acces not authorized')
	res.render('protected')
})

app.listen(PORT, function () {
	console.log("Aplicacion en puerto: " + PORT)
})
app.get('/verify', async (req, res) => {
	const { token } = req.query; // extraemos el token de la URL

	if (!token) return res.status(400).send("Token no proporcionado");

	try {
		// Buscar usuario con ese token
		const user = await User.findOne({ verificationToken: token });
		if (!user) return res.status(400).send("Token inválido o ya usado");

		// Marcar usuario como verificado
		user.isVerified = true; // necesitas un campo booleano isVerified en tu modelo
		user.verificationToken = undefined; // eliminar token para que no se pueda usar otra vez

		await user.save();

		// Mostrar mensaje directamente
		res.render('verifySuccess', { username: user.username });
	} catch (error) {
		console.error(error);
		res.status(500).send("Error al verificar la cuenta");
	}
});


//editar usuario 
app.get("/editar/:id", async function editar(req, res) {
	try {
		const user = await UserRepository.buscarPorId(req.params.id)
		res.render("editarUser", { user })
	} catch (error) {
		console.log(error)
	}
})

app.post("/editarCambios", async function (req, res) {
	const respuesta = await UserRepository.editarContacto(req.body)
	console.log(respuesta, "editado")
	res.redirect("/showUser")
})

app.get("/eliminar/:id", async function (req, res) {
	const id = req.params.id; // recibimos un parametro a traves de la url el id 
	try {
		const userPorId = await UserRepository.buscarPorId(id)
		res.render("eliminarUser", { userPorId })
	} catch (error) {
		console.log("Error no se pudo actualizar", error)
	}
})

app.get("/eliminarConfirmado/:id", async function (req, res) {
	const respuesta = await UserRepository.eliminarContacto(req.params.id)
	//console.log(respuesta, "eliminado")
	res.redirect("/showUser")
})


app.post("/buscarContacto", async function (req, res) {
	const username = req.body.username
	const users = await UserRepository.buscarContacto(username)
	res.render("showUser", { users })
})



// Mostrar los vendedores y sus productos

// Vista principal: tablero de vendedores
app.get('/locales', async (req, res) => {
  try {
    const resVendedores = await fetch(`${API_BASE}/vendedores?limit=100&offset=0`);
    const dataVendedores = await resVendedores.json();

    console.log('DATA VENDEDORES:', dataVendedores); // 👈

    res.render('locales', { vendedores: dataVendedores.items });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al obtener vendedores');
  }
});

// Vista de productos de un vendedor
app.get('/locales/:id/productos', async (req, res) => {
  try {
    const { id } = req.params;
    const resProductos = await fetch(`${API_BASE}/vendedores/${id}/productos?limit=100&offset=0`);
    const dataProductos = await resProductos.json();
    res.render('productos', {
      nombre_vendedor: dataProductos.nombre_vendedor,
      productos: dataProductos.items ?? [],
      vendedor_id: id, 
    });
  } catch (error) {
    res.status(500).send('Error');
  }
});

// Detalle de un producto
app.get('/locales/:vendedorId/productos/:productoId', async (req, res) => {
  try {
    const { vendedorId, productoId } = req.params;

    const [resProducto, resVendedor] = await Promise.all([
      fetch(`${API_BASE}/productos/${productoId}`),
      fetch(`${API_BASE}/vendedores/${vendedorId}`)
    ]);

    const producto = await resProducto.json();
    const vendedor = await resVendedor.json();

    res.render('producto-detalle', { producto, vendedor });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al obtener el producto');
  }
});


// login de vendedores
// Middleware solo para admin
// Vista del dashboard admin
app.get('/admin', verifyAdmin, (req, res) => {
  res.render('admin-vendedores');
});
// GET — listar vendedores con rol vendedor
app.get('/admin/vendedores', verifyAdmin, async (req, res) => {
  try {
    const response = await fetch(`${API_BASE}/vendedores?limit=100&offset=0`);
    const data = await response.json();
    res.json(data.items ?? []);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener vendedores' });
  }
});
// POST — crear vendedor
app.post('/admin/vendedores', verifyAdmin, async (req, res) => {
  const { nombre, username, email, password, telefono, vendedor_id, local } = req.body;
  try {
    const rolVendedor = await Role.findOne({ rol: 'vendedor' });
    if (!rolVendedor) {
      return res.status(400).json({ message: 'El rol "vendedor" no existe.' });
    }

    const hash   = await bcrypt.hash(password, 10);
    const userId = uuidv4(); // ✅ ya disponible desde el import del inicio

    await User.create({
      _id:        userId,
      username,
      email,
      nombre,
      telefono,
      password:   hash,
      role:       rolVendedor._id,
      isVerified: true
    });

    await Vendedor.create({
      _id:          uuidv4(),
      user_id:      userId,
      vendedor_id,
      nombre_local: local,
      telefono,
      activo:       true
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE — eliminar vendedor
app.delete('/admin/vendedores/:id', verifyAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// GET — solicitudes pendientes
app.get('/admin/solicitudes', verifyAdmin, async (req, res) => {
  // necesitas un modelo Solicitud — lo creamos después
  res.json([]);
});

// crear rol si no existe
async function crearRolVendedor() {
  const existe = await Role.findOne({ rol: 'vendedor' });
  if (!existe) {
    await Role.create({
      rol: 'vendedor',
      description: 'Vendedor con acceso al panel de productos'
    });
    console.log('✅ Rol vendedor creado');
  }
}
crearRolVendedor();


//LOGIN VENDEDORES
// GET — vista login vendedor
app.get('/login-vendedor', (req, res) => {
  res.render('login-vendedor');
});

// POST — procesar login vendedor
app.post('/login-vendedor', async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await fetch(`${API_BASE}/credenciales/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ message: data.detail || 'Credenciales incorrectas' });
    }

    // Crear token con los datos del vendedor
    const token = jwt.sign(
      {
        vendedor_id: data.data.vendedor_id,
        username:    data.data.username,
        role:        'vendedor'
      },
      SECRET_JWT_KEY,
      { expiresIn: '8h' }
    );

    res.cookie('vendedor_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   1000 * 60 * 60 * 8
    });

    res.json({ redirect: '/panel' });

  } catch (err) {
    res.status(500).json({ message: 'Error de conexión' });
  }
});

// ── RUTAS DEL PANEL DE VENDEDOR ──

function requireVendedor(req, res, next) {
  const token = req.cookies.vendedor_token;
  if (!token) return res.redirect('/login-vendedor');
  try {
    req.vendedor = jwt.verify(token, SECRET_JWT_KEY);
    next();
  } catch { res.redirect('/login-vendedor'); }
}

// Panel principal
app.get('/panel', requireVendedor, async (req, res) => {
  const [resV, resP] = await Promise.all([
    fetch(`${API_BASE}/vendedores/${req.vendedor.vendedor_id}`),
    fetch(`${API_BASE}/vendedores/${req.vendedor.vendedor_id}/productos?limit=100&offset=0`)
  ]);
  const vendedor  = await resV.json();
  const productos = await resP.json();
  res.render('panel-vendedor', { vendedor, productos: productos.items ?? [], vendedor_id: req.vendedor.vendedor_id });
});

// CRUD productos
app.post('/panel/productos', requireVendedor, async (req, res) => {
  const r = await fetch(`${API_BASE}/productos/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) });
  const d = await r.json();
  r.ok ? res.json({ success: true }) : res.status(400).json({ message: JSON.stringify(d) });
});

app.put('/panel/productos/:id', requireVendedor, async (req, res) => {
  const r = await fetch(`${API_BASE}/productos/${req.params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) });
  const d = await r.json();
  r.ok ? res.json({ success: true }) : res.status(400).json({ message: JSON.stringify(d) });
});

app.delete('/panel/productos/:id', requireVendedor, async (req, res) => {
  await fetch(`${API_BASE}/productos/${req.params.id}`, { method: 'DELETE' });
  res.json({ success: true });
});

// Actualizar perfil
app.put('/panel/perfil', requireVendedor, async (req, res) => {
  const r = await fetch(`${API_BASE}/vendedores/${req.vendedor.vendedor_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) });
  r.ok ? res.json({ success: true }) : res.status(400).json({ message: 'Error al actualizar' });
});

// Cambiar contraseña
app.put('/panel/cambiar-password', requireVendedor, async (req, res) => {
  const r = await fetch(`${API_BASE}/credenciales/${req.vendedor.vendedor_id}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: req.body.password }) });
  r.ok ? res.json({ success: true }) : res.status(400).json({ message: 'Error al cambiar contraseña' });
});

// Logout vendedor
app.post('/logout-vendedor', (req, res) => {
  res.clearCookie('vendedor_token').json({ success: true });
});


// GET — listar todas las credenciales
app.get('/admin/credenciales', verifyAdmin, async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/credenciales/`);
    const d = await r.json();
    res.json(d);
  } catch { res.status(500).json([]); }
});

// POST — crear credencial
app.post('/admin/credenciales', verifyAdmin, async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/credenciales/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const d = await r.json();
    r.ok ? res.json({ success: true }) : res.status(400).json({ message: JSON.stringify(d) });
  } catch { res.status(500).json({ message: 'Error de conexión' }); }
});

// PUT — actualizar credencial
app.put('/admin/credenciales/:id', verifyAdmin, async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/credenciales/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    r.ok ? res.json({ success: true }) : res.status(400).json({ message: 'Error al actualizar' });
  } catch { res.status(500).json({ message: 'Error de conexión' }); }
});

// DELETE — eliminar credencial
app.delete('/admin/credenciales/:id', verifyAdmin, async (req, res) => {
  try {
    await fetch(`${API_BASE}/credenciales/${req.params.id}`, { method: 'DELETE' });
    res.json({ success: true });
  } catch { res.status(500).json({ message: 'Error' }); }
});


//recibe solicitudes de vendedorese
app.post('/registro_vendedor', async (req, res) => {
  console.log('📩 Body recibido:', req.body); // 👈
  const { nombre, email, negocio, telefono, mensaje } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });

    console.log('📧 Enviando correo a:', EMAIL_USER); // 👈

    await transporter.sendMail({
      from: EMAIL_USER,
      to: EMAIL_USER,
      subject: `Nueva solicitud de vendedor — ${negocio}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <h2 style="color:#20948B;">Nueva solicitud de vendedor</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Negocio:</strong> ${negocio}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || '—'}</p>
          <p><strong>Detalles:</strong><br>${(mensaje||'').replace(/\n/g,'<br>')}</p>
        </div>
      `
    });

    console.log('✅ Correo enviado'); // 👈
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error:', err.message); // 👈
    res.status(400).json({ message: err.message });
  }
});