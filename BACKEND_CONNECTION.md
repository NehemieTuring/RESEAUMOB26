# 🔗 FleetMan - Connexion Frontend Mobile ↔ Backend

## Configuration de l'API

### Base URL
```typescript
// src/constants/Config.ts
export const API_BASE_URL = 'http://192.168.198.96:9080/api';
```

> ⚠️ **Important**: Mettez à jour cette IP avec votre adresse IP locale lorsque vous changez de réseau.

---

## Services API Connectés

### 1. Authentication (`authApi.ts`)
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `loginAdmin()` | `POST /auth/admin/login` | Connexion Admin |
| `loginFleetManager()` | `POST /auth/fleet-manager/login` | Connexion Fleet Manager |
| `loginDriver()` | `POST /auth/driver/login` | Connexion Conducteur |
| `login()` | Auto-détection | Essaie les 3 types de login |

### 2. Organizations (`organizationApi.ts`)
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /organizations` | Liste des organisations |
| `getById()` | `GET /organizations/{id}` | Détails organisation |
| `create()` | `POST /organizations` | Créer organisation |
| `update()` | `PUT /organizations/{id}` | Modifier organisation |
| `delete()` | `DELETE /organizations/{id}` | Supprimer organisation |

### 3. Fleet Managers (`fleetManagerApi.ts`)
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /fleet-managers` | Liste des gestionnaires |
| `getById()` | `GET /fleet-managers/{id}` | Détails gestionnaire |
| `getByAdmin()` | `GET /fleet-managers/admin/{adminId}` | Gestionnaires par admin |

### 4. Fleets (`fleetApi.ts`)
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /fleets` | Liste des flottes |
| `getById()` | `GET /fleets/{id}` | Détails flotte |
| `getByManager()` | `GET /fleets/manager/{managerId}` | Flottes par gestionnaire |

### 5. Vehicles (`vehicleApi.ts`)
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /vehicles` | Liste des véhicules |
| `getById()` | `GET /vehicles/{id}` | Détails véhicule |
| `getByFleet()` | `GET /vehicles/fleet/{fleetId}` | Véhicules par flotte |
| `getByState()` | `GET /vehicles/state/{state}` | Véhicules par état |
| `create()` | `POST /vehicles` | Créer véhicule |
| `update()` | `PUT /vehicles/{id}` | Modifier véhicule |
| `delete()` | `DELETE /vehicles/{id}` | Supprimer véhicule |

### 6. Drivers (`driverApi.ts`)
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /drivers` | Liste des conducteurs |
| `getById()` | `GET /drivers/{id}` | Détails conducteur |
| `getByState()` | `GET /drivers/state/{state}` | Conducteurs par état |
| `create()` | `POST /drivers` | Créer conducteur |
| `update()` | `PUT /drivers/{id}` | Modifier conducteur |
| `delete()` | `DELETE /drivers/{id}` | Supprimer conducteur |

### 7. Geofences (`geofenceApi.ts`) ✨ NEW
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /geofences` | Liste des zones |
| `getById()` | `GET /geofences/{id}` | Détails zone |
| `createCircle()` | `POST /geofences/circle` | Créer zone circulaire |
| `createPolygon()` | `POST /geofences/polygon` | Créer zone polygonale |

### 8. Positions (`positionApi.ts`) ✨ NEW
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /positions` | Toutes les positions |
| `getByVehicle()` | `GET /positions/vehicle/{vehicleId}` | Positions par véhicule |
| `getLatest()` | `GET /positions/vehicle/{vehicleId}/latest` | Dernière position |
| `create()` | `POST /positions` | Envoyer position GPS |

### 9. Trips (`tripApi.ts`) ✨ NEW
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /trips` | Liste des trajets |
| `getById()` | `GET /trips/{id}` | Détails trajet |
| `getByDriver()` | `GET /trips/driver/{driverId}` | Trajets par conducteur |
| `getByVehicle()` | `GET /trips/vehicle/{vehicleId}` | Trajets par véhicule |
| `start()` | `PUT /trips/{id}` | Démarrer trajet |
| `complete()` | `PUT /trips/{id}` | Terminer trajet |

### 10. Notifications (`notificationApi.ts`) ✨ NEW
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /notifications` | Toutes notifications |
| `getByFleetManager()` | `GET /notifications/manager/{id}` | Par gestionnaire |
| `markAsRead()` | `PUT /notifications/{id}/read` | Marquer comme lu |
| `create()` | `POST /notifications` | Créer notification |

### 11. Fuel Recharges (`fuelRechargeApi.ts`) ✨ NEW
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /fuel-recharges` | Liste des recharges |
| `getByVehicle()` | `GET /fuel-recharges/vehicle/{id}` | Par véhicule |
| `getByDriver()` | `GET /fuel-recharges/driver/{id}` | Par conducteur |
| `create()` | `POST /fuel-recharges` | Enregistrer recharge |

### 12. Maintenance (`maintenanceApi.ts`) ✨ NEW
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /maintenances` | Liste maintenances |
| `getByVehicle()` | `GET /maintenances/vehicle/{id}` | Par véhicule |
| `create()` | `POST /maintenances` | Enregistrer maintenance |

### 13. Incidents (`incidentApi.ts`)
| Fonction | Endpoint | Description |
|----------|----------|-------------|
| `getAll()` | `GET /incidents` | Liste des incidents |
| `getById()` | `GET /incidents/{id}` | Détails incident |
| `create()` | `POST /incidents` | Signaler incident |
| `update()` | `PUT /incidents/{id}` | Modifier incident |

---

## Pages Connectées

| Page | Données Chargées |
|------|------------------|
| **Login** | `authApi.login()` → Authentification réelle |
| **Home** | `vehicleApi`, `driverApi`, `fleetApi`, `notificationApi` |
| **Vehicles** | `vehicleApi.getAll()` |
| **Drivers** | `driverApi.getAll()` |
| **Map** | `positionApi.getLatest()` → Positions GPS en temps réel |

---

## Identifiants de Test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `nehemie@gmail.com` | `nehemie@123` | SUPER_ADMIN |
| `samuel.mendouga@email.cm` | `Driver123!@#` | DRIVER |
| `emmanuel.biya@transcam.cm` | `Driver123!@#` | FLEET_MANAGER |

---

## Démarrage

### 1. Backend
```bash
cd D:\MAGIE\reseaux\backend\Fleetman
docker compose up -d
./mvnw spring-boot:run
```

### 2. Frontend Mobile
```bash
cd D:\MAGIE\reseaux\AppMob
npx expo start
```

### 3. Scanner QR Code avec Expo Go

---

## Structure des Services

```
src/services/
├── api.ts                 # Client HTTP de base
├── authApi.ts             # Auth + Admin + Organization
├── vehicleApi.ts          # Véhicules
├── driverApi.ts           # Conducteurs
├── fleetApi.ts            # Flottes
├── fleetManagerApi.ts     # Gestionnaires
├── geofenceApi.ts         # Zones géographiques ✨
├── positionApi.ts         # Positions GPS ✨
├── tripApi.ts             # Trajets ✨
├── notificationApi.ts     # Notifications ✨
├── fuelRechargeApi.ts     # Carburant ✨
├── maintenanceApi.ts      # Maintenance ✨
├── incidentApi.ts         # Incidents
└── index.ts               # Exports centralisés
```

---

## Notes Techniques

1. **Gestion des erreurs**: Tous les appels API sont wrappés dans try/catch
2. **Token Bearer**: Le client API supporte l'authentification JWT (à activer côté backend)
3. **Logs**: Les requêtes/réponses sont loggées en console pour le debug
4. **AsyncStorage**: Utilisé pour persister les données utilisateur

✨ = Nouveaux services ajoutés lors de cette intégration
