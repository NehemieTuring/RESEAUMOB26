# FleetMan Backend — Monolithe en couches

Réécriture du backend `FleetMan-DES` (hexagonal réactif WebFlux/R2DBC) en **monolithe Spring Boot MVC + JPA/Hibernate + PostgreSQL synchrone**.

- **Java 17**, **Spring Boot 3.2.6**, package racine `com.fleetman.backend`
- Les 4 APIs externes (Auth/Kernel, Vehicle, Geofence, Payment) sont **internalisées** en services locaux.

## Architecture (couches)

```
com.fleetman.backend
├── controller/          @RestController (32 contrôleurs, tous sous /api/v1)
│   └── dto/             Request/Response (records)
├── service/             @Service (services internes + métier, 31)
├── repository/          @Repository JPA (48)
├── entity/              @Entity JPA (49, dont LookupEntity @MappedSuperclass)
├── exception/           DomainException + sous-classes + GlobalExceptionHandler
├── config/              SecurityConfig, OpenApiConfig, DataBootstrap
│   └── security/        JwtUtil, JwtAuthenticationFilter
└── FleetManApplication.java
```

## Prérequis

- JDK 17+
- Maven **non requis** : le projet embarque un **Maven Wrapper** (`./mvnw`) qui télécharge
  Maven 3.9.9 automatiquement au premier lancement.
- PostgreSQL avec une base `fleetmanBD` et le rôle `fleet_admin` / `fleet_password`
  (paramétrable via variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`).

```sql
CREATE DATABASE "fleetmanBD";
CREATE USER fleet_admin WITH PASSWORD 'fleet_password';
GRANT ALL PRIVILEGES ON DATABASE "fleetmanBD" TO fleet_admin;
```

Le schéma PostgreSQL `fleet` et toutes les tables sont **créés automatiquement** par
Hibernate au démarrage (`spring.jpa.hibernate.ddl-auto=update` +
`hibernate.hbm2ddl.create_namespaces=true`). Liquibase est désactivé.

## Build & Run

Avec le wrapper (aucune installation de Maven nécessaire) :

```bash
# Linux / macOS / Git Bash
./mvnw clean package
./mvnw spring-boot:run
```

```powershell
# Windows PowerShell / cmd
.\mvnw.cmd clean package
.\mvnw.cmd spring-boot:run
```

Ou avec un Maven déjà installé (`mvn clean package`), puis :

```bash
java -jar target/fleet-management-backend-1.0.0-SNAPSHOT.jar
```

L'application démarre sur **http://localhost:8082**.

## Swagger / OpenAPI — tous les endpoints exposés

L'interface Swagger expose automatiquement **la totalité des endpoints REST** des 32 contrôleurs,
regroupés par tags (`01. Authentification`, `02. Mon Compte`, …) et triés alphabétiquement.
Un bouton **Authorize** permet de coller le JWT (`Bearer <accessToken>`) pour tester les
endpoints sécurisés.

- Swagger UI : http://localhost:8082/swagger-ui.html
- Spec OpenAPI JSON : http://localhost:8082/v3/api-docs
- Health : http://localhost:8082/api/v1/health

## Compte super-admin initial

Créé automatiquement au premier démarrage (`DataBootstrap`) :

- identifiant : `joeltaba4@gmail.com` (ou username `joeltaba4`)
- mot de passe : `FleetMan2026!`
- rôle : `FLEET_SUPER_ADMIN`

## Authentification

JWT HS256. Login via `POST /api/v1/auth/login` `{ "identifier": "...", "password": "..." }`,
puis header `Authorization: Bearer <accessToken>` sur les endpoints sécurisés.

Endpoints publics : `/api/v1/auth/**`, `/api/v1/health/**`, `GET /api/v1/files/**`, Swagger.

## Remplacement des services externes

| Ancien port sortant       | Nouveau service interne       |
|---------------------------|-------------------------------|
| AuthPort / KernelAuth     | `InternalAuthService`         |
| ExternalVehiclePort       | `InternalVehicleService`      |
| ExternalGeofencePort      | `InternalGeofenceService`     |
| ExternalPaymentPort       | `InternalPaymentService` (wallets) |
| SendNotificationPort      | `InternalNotificationService` |
| Stockage fichiers distant | `FileStorageService` (disque `./uploads`) |
| DistanceCalculatorPort    | Haversine dans `InternalGeofenceService` |

## Note

> La compilation Maven n'a pas pu être exécutée dans l'environnement de génération
> (Maven absent, réseau restreint). Lancer `mvn clean package` en local pour valider.
