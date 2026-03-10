
## Instrucciones para correr el proyecto localmente

1. **Clonar el repositorio**
   - `git clone <url-del-repo>`
   - `cd catalogo`

2. **Instalar dependencias de PHP**
   - `composer install`

3. **Configurar el archivo `.env`**
   - Copia `.env.example` a `.env` si aún no existe.
   - Configura la conexión a la base de datos (host, puerto, base de datos, usuario y contraseña).

4. **Generar la clave de la aplicación**
   - `php artisan key:generate`

5. **Ejecutar migraciones y seeders**
   - `php artisan migrate --seed`
   - Esto creará las tablas (incluyendo `categories` y `products`) y cargará las categorías de ejemplo.

6. **Levantar el servidor de desarrollo**
   - `php artisan serve`
   - La API estará disponible típicamente en `http://127.0.0.1:8000`.

7. **Consumir la API desde el frontend**
   - Asegúrate de que tu frontend (por ejemplo Vite) corra en `http://localhost:5173` para que CORS lo permita.

## BUGS 

1. // routes/users.js (Node.js / Express)
    
    * Problemas detectados:
        - en select permite inyección SQL al concatenar directamente el input  del usuario
        - el select devuelve todas las columnas y no tiene límite

    * Corrección: 

        const db = require('../db');
        const bcrypt = require('bcrypt');

        router.get('/users', async (req, res) => {
            const { search } = req.query;
            const searchTerm = `%${search}%`;

            const users = await db.query(
                'SELECT id, name, email FROM users WHERE name LIKE ? LIMIT 100',
                [searchTerm]                  
            );

            res.json(users);
        });


2. 
    * Problemas detectados:
        - se puede hacer inyección SQL al igual que el código anterior
        - no se cifra la contraseña al momento guardarla

    * Corrección:
        router.post('/users', async (req, res) => {
            const { name, email, password } = req.body;

            const hashedPassword = await bcrypt.hash(password, 12); 

            await db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword] 
            );

            res.status(201).json({ success: true });
        });

3. 
    * Problemas detectados:
        - también permite inyección SQL al eliminar
        - se debe devolver la excepcion en el bloque catch en el caso que haya un error al eliminar


    * Corrección:
        router.delete('/users/:id', async (req, res) => {
            try {
                const { id } = req.params;

                await db.query(
                'DELETE FROM users WHERE id = ?',
                [id]                        
                );

                res.json({ deleted: true });

            } catch (e) {
                console.error('Error deleting user:', e);
                res.status(500).json({ deleted: false, error: 'Internal server error' });
            }
        });





# AWS.md

## 1. ¿Qué servicio(s) de AWS usarías y por qué?


### **Amazon S3**


S3 se utilizaría para almacenar las imágenes de productos porque:

* Está diseñado para **almacenamiento de objetos** como imágenes, videos o archivos.
* Permite **alta durabilidad (99.999999999%)** y disponibilidad.
* Permite **acceso público controlado por políticas**.
* Se integra fácilmente con aplicaciones que corren en **EC2**.

### **Amazon EC2**

Amazon EC2

La aplicación backend corre en EC2 y se encarga de:

* Generar **URLs firmadas (presigned URLs)** para subir imágenes.
* Controlar qué usuarios pueden subir archivos.
* Evitar que el bucket sea editable directamente desde internet.

Opcionalmente podría usarse:

Amazon CloudFront

Para distribuir las imágenes con:

* menor latencia
* caché global
* reducción de costos de transferencia desde S3.

---

# 2. Política de bucket

El bucket debe permitir **lectura pública de objetos**, pero **bloquear escritura pública**.

Ejemplo de política:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::product-images-bucket/*"
    }
  ]
}
```

Además:

* **Bloquear acceso público para escritura**
* Solo permitir **PutObject desde el rol de EC2**

Ejemplo de política IAM para el rol de EC2:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject"
  ],
  "Resource": "arn:aws:s3:::product-images-bucket/*"
}
```

---

# 3. ¿Cómo generar URLs firmadas (Presigned URLs) para subida segura?

Las **presigned URLs** permiten que el cliente suba archivos directamente a S3 sin exponer credenciales.

Flujo:

1. El cliente solicita al backend una URL para subir una imagen.
2. El backend genera una **presigned URL** usando el SDK de AWS.
3. El cliente usa esa URL para hacer un **PUT directo a S3**.

Ejemplo en **Node.js** con el SDK de AWS:

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });

export async function generateUploadUrl(fileName) {
  const command = new PutObjectCommand({
    Bucket: "product-images-bucket",
    Key: `products/${fileName}`,
    ContentType: "image/jpeg"
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });

  return url;
}
```

El cliente luego puede subir la imagen:

```
PUT https://presigned-url
Content-Type: image/jpeg
```

---

# 4. Consideración de costos

Una consideración importante es:

### Transferencia de datos

Amazon S3 cobra por:

* almacenamiento mensual (GB)
* requests (PUT, GET)
* transferencia de datos saliente

Para optimizar costos:

* usar **CloudFront** para cachear imágenes
* aplicar **Lifecycle Policies** para mover imágenes antiguas a **S3 Standard-IA** o **Glacier**
* comprimir imágenes antes de subirlas.
