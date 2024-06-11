import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import messageModel from './models/messages.js'
import indexRouter from './routes/indexRouter.js'
import initializePassport from './config/passport/passport.js'
import varenv from './dotenv.js'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'
import { __dirname } from './path.js'
import { generateRandomProducts } from './controllers/productController.js'
import { generateRandomUsers } from './controllers/userController.js'
import { addLogger } from './utils/logger.js'

//Configuraciones o declaraciones
const app = express()
const PORT = 8000

// **** CORS ***** 

const corsOptions = {
    //solo las rutas que esten dentro de origin se va a poder conectar
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'UPDATE', 'DELETE']
  }
  
  // Se aplica el middleware CORS con opciones personalizadas.
  app.use(cors(corsOptions))
  //ruta para verificar el funcionamiento de cors
  // Defino una ruta GET llamada '/bienvenida'
  app.get('/bienvenida', (req, res) => {
    // Cuando se haga una solicitud GET a '/bienvenida', se ejecuta esta función de devolución de llamada
    // req: representa la solicitud HTTP que llega al servidor
    // res: representa la respuesta HTTP que será enviada de vuelta al cliente
    // Configura el código de estado de la respuesta como 200 (OK) y envía un objeto JSON como respuesta
    res.status(200).send({ mensaje: "Bienvenidos a SuShop Ecommerce" })
  })
  

//**** Server ******
const server = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})

const io = new Server(server)

//**** Connection MongoDB ******
mongoose.connect(varenv.mongo_url)
    .then(() => console.log("DB is connected"))
    .catch(e => console.log(e))

//***** Middlewares *******
app.use(express.json())

app.use(express.urlencoded({ extended: true })) // enviar info desde la URL

//***** Cookies *******
app.use(cookieParser( varenv.cookies_secret ))

//***** Inicio de Sesion *****
app.use(session({
    secret: varenv.session_secret,
    resave: true,
    store: MongoStore.create({
        mongoUrl: varenv.mongo_url,
        ttl: 60 * 60
    }),
    saveUninitialized: true
}))

//***** Handlebars *****
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

//***** Passport *****
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

//***** Routes ******

app.use('/', indexRouter)

//***** Routes Cookies ******
app.get('/setCookie', (req, res) => {
    res.cookie('CookieCookie', 'Esto es una cookie :)', { maxAge: 3000000, signed: true }).send("Cookie creada")
})

app.get('/getCookie', (req, res) => {
    res.send(req.signedCookies)
})

app.get('/deleteCookie', (req, res) => {
    res.clearCookie('CookieCookie').send("Cookie eliminada")
    //res.cookie('CookieCokie', '', { expires: new Date(0) })
})

//Session Routes

app.get('/session', (req, res) => {
    console.log(req.session)
    if (req.session.counter) {
        req.session.counter++
        res.send(`Sos el usuario N° ${req.session.counter} en ingresar a la pagina`)
    } else {
        req.session.counter = 1
        res.send("Sos el primer usuario que ingresa a la pagina")
    }
})

app.post('/login', (req, res) => {
    const { email, password } = req.body

    if (email == "admin@admin.com" && password == "1234") {
        req.session.email = email
        req.session.password = password


    }
    console.log(req.session)
    res.send("Login OK")
})

// Websockets
io.on('connection', (socket) => {
    console.log("Conexion con Socket.io")

    socket.on('mensaje', async (mensaje) => {
        try {
            await messageModel.create(mensaje)
            const mensajes = await messageModel.find()
            io.emit('mensajeLogs', mensajes)
        } catch (e) {
            io.emit('mensajeLogs', e)
        }

    })

})

// Logger //

app.get('/loggerTest', (req, res) => {
    try {
      // Acceder al logger desde la solicitud (req.logger) y registrar un mensaje de cada nivel de log
      req.logger.debug('Este es un mensaje de depuración');
      req.logger.http('Este es un mensaje HTTP');
      req.logger.info('Este es un mensaje de información');
      req.logger.warning('Este es un mensaje de advertencia');
      req.logger.error('ERROR');
      req.logger.fatal('FATAL ERROR');
  
      // Enviar una respuesta al cliente
      res.send('Los logs se han registrado en la consola y en los archivos correspondientes.');
    } catch (e) {
      // Registrar el error y enviar una respuesta de error al cliente
      //CUANDO PASA ACA VA A SER UN FATAL O UN ERROR
      req.logger.error(`Metodo: ${req.method} en ruta ${req.url} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)
      res.status(500).send('Ocurrió un error al registrar los logs.');
    }
  });

// ***** MOCKING Productos aleatorios *****
//RUTA DE PRUEBA EN POSTMAN: localhost:8000/mockingproducts
// Endpoint '/mockingproducts' manejado por el controlador
app.get('/mockingproducts', (req, res) => {
    const products = generateRandomProducts();
    console.log(products);    
    res.json(products);
  });
   
    app.get('/mockingusers', (req, res) => {
    const users = generateRandomUsers();
    console.log(users);    
    res.json(users);
  });