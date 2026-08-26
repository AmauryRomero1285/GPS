import fs from 'node:fs';
import path from 'node:path';

// Cargar variables de entorno desde .env
const envPath = path.resolve(process.cwd(), '.env');
let apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/EXPO_PUBLIC_API_URL=(.+)/);
  if (match && match[1]) {
    apiUrl = match[1].trim();
  }
}

const baseUrl = apiUrl.replace(/\/api\/?$/, '');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║               TEST DE CONEXIÓN API DESDE FRONTEND             ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`\n📍 URL configurada en .env : ${apiUrl}`);
console.log(`🌐 Servidor Base           : ${baseUrl}\n`);

const tests = [
  {
    name: '1. Raíz del Servidor (Nginx / Web)',
    url: baseUrl,
    method: 'GET',
    description: 'Comprueba si el servidor web responde en el puerto 80/443',
  },
  {
    name: '2. Health Check (/health)',
    url: `${baseUrl}/health`,
    method: 'GET',
    description: 'Endpoint de salud del backend Express',
  },
  {
    name: '3. Health Check (/api/health)',
    url: `${apiUrl}/health`,
    method: 'GET',
    description: 'Endpoint de salud con prefijo /api',
  },
  {
    name: '4. Auth Login (POST /api/auth/login)',
    url: `${apiUrl}/auth/login`,
    method: 'POST',
    body: { email: 'test@example.com', password: 'password123' },
    description: 'Endpoint de autenticación para iniciar sesión',
  },
  {
    name: '5. Auth Register (POST /api/auth/register)',
    url: `${apiUrl}/auth/register`,
    method: 'POST',
    body: { name: 'Test', email: 'test@example.com', password: 'password123' },
    description: 'Endpoint de registro de usuarios',
  },
  {
    name: '6. Devices (GET /api/devices)',
    url: `${apiUrl}/devices`,
    method: 'GET',
    description: 'Endpoint protegido de dispositivos',
  },
];

async function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  for (const test of tests) {
    const startTime = Date.now();
    try {
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: test.body ? JSON.stringify(test.body) : undefined,
      };

      const response = await fetch(test.url, options);
      const duration = Date.now() - startTime;
      const contentType = response.headers.get('content-type') || 'desconocido';
      const text = await response.text();

      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }

      const isHtml = contentType.includes('text/html');

      console.log(`----------------------------------------------------------------`);
      console.log(`🔹 ${test.name}`);
      console.log(`   URL      : ${test.url}`);
      console.log(`   Método   : ${test.method}`);
      console.log(`   Estado   : ${response.status} ${response.statusText} (${duration}ms)`);
      console.log(`   Tipo     : ${contentType}`);

      if (json) {
        console.log(`   Respuesta (JSON):`, JSON.stringify(json, null, 2));
        passedCount++;
      } else if (isHtml) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 'HTML Page';
        console.log(`   ⚠️  Respuesta HTML detectada: "${title}"`);
        if (text.includes('nginx')) {
          console.log(`   ℹ️  Servidor: Nginx (El proxy inverso no está reenviando /api al backend Node.js)`);
        }
        failedCount++;
      } else {
        console.log(`   Texto: ${text.slice(0, 120)}`);
      }
    } catch (err) {
      console.log(`----------------------------------------------------------------`);
      console.log(`❌ ${test.name}`);
      console.log(`   URL      : ${test.url}`);
      console.log(`   ERROR    : ${err.message}`);
      failedCount++;
    }
  }

  console.log(`\n================================================================`);
  console.log(`📊 DIAGNÓSTICO FINAL`);
  console.log(`================================================================`);
  if (failedCount > 0) {
    console.log(`⚠️  El dominio https://locfar.app responde con Nginx (200 en la raíz), pero todas las rutas /api devuelven 404 HTML.`);
    console.log(`👉 Causa principal:`);
    console.log(`   1. El backend de Node.js/Express no está corriendo en el servidor o contenedor.`);
    console.log(`   2. La configuración de Nginx en locfar.app no tiene un 'location /api/' o 'proxy_pass http://localhost:4000;'.`);
  } else {
    console.log(`✅ La API responde correctamente desde el frontend.`);
  }
}

runTests();
