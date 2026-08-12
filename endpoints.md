# Liste des Endpoints API de l'Application Mobile FleetMan

Ce document recense les endpoints API utilisés par l'application mobile, triés par rôle et par fonctionnalité (incluant l'authentification et la gestion des profils).

---

## 1. Communs (Authentification, Inscription et Profil)
Ces endpoints concernent la connexion et la gestion du profil personnel, et sont utilisés par **tous les rôles** (Administrateurs, Gestionnaires, Conducteurs).

* **Pages de Connexion et Sécurité**
  * Connexion unifiée : `POST /v1/auth/login`
  * Rafraîchissement de token : `POST /v1/auth/refresh`
  * Mot de passe oublié : `POST /v1/auth/forgot-password`
  * Réinitialisation de mot de passe : `POST /v1/auth/reset-password`

* **Pages d'Inscription Publique**
  * Inscription d'un gestionnaire : `POST /v1/public/register-manager`
  * Liste des plans d'abonnement : `GET /v1/public/subscription-plans`

* **Pages de Profil Personnel**
  * Consulter son profil actuel (Me) : `GET /v1/auth/me`
  * Mettre à jour ses informations : `POST /v1/account/profile`
  * Changer de mot de passe : `POST /v1/account/password`
  * Uploader sa photo de profil : `POST /v1/account/photo` (Multipart/form-data)
  * Supprimer son compte : `DELETE /v1/account`

---

## 2. Rôle : Administrateur (Admin / Super Admin)
Ces endpoints alimentent les tableaux de bord et les vues de gestion globale du système.

* **Gestion des Gestionnaires (Managers)**
  * Liste des gestionnaires : `GET /v1/admin/managers`
  * Activer un gestionnaire : `POST /v1/admin/managers/{userId}/activate`
  * Désactiver un gestionnaire : `POST /v1/admin/managers/{userId}/deactivate`
  * Supprimer un gestionnaire : `DELETE /v1/admin/managers/{userId}`
  
* **Gestion Globale & Statistiques**
  * Statistiques de la plateforme : `GET /v1/admin/stats`
  * Créer un administrateur système : `POST /v1/admin/admins`
  * Ajouter un rôle à un utilisateur : `POST /v1/admin/users/{userId}/roles`
  * Liste de tous les utilisateurs (détails) : `GET /v1/admin/users/{userId}`

* **Gestion des Référentiels (Types de véhicules, etc.)**
  * Liste des types de véhicules : `GET /v1/admin/resources/vehicle-types`
  * Créer un type : `POST /v1/admin/resources/vehicle-types`
  * Supprimer un type : `DELETE /v1/admin/resources/vehicle-types/{id}`

---

## 3. Rôle : Gestionnaire de Flotte (Fleet Manager)
Le gestionnaire possède des endpoints pour la gestion de sa société (organisation), ses flottes, véhicules et conducteurs.

* **Profil de l'Organisation / Société**
  * Mettre à jour les informations de l'entreprise : `PUT /v1/fleet-managers/me/company`
  * Uploader le logo de l'entreprise : `POST /v1/fleet-managers/me/company/logo`

* **Gestion des Flottes**
  * Liste de ses flottes : `GET /v1/fleets`
  * Détails d'une flotte : `GET /v1/fleets/{fleetId}`
  * Créer une flotte : `POST /v1/fleets`
  * Modifier une flotte : `PUT /v1/fleets/{fleetId}`
  * Supprimer une flotte : `DELETE /v1/fleets/{fleetId}`
  * Statistiques de la flotte : `GET /v1/fleets/{fleetId}/stats`

* **Gestion des Véhicules**
  * Liste globale de ses véhicules : `GET /v1/vehicles`
  * Véhicules par flotte : `GET /v1/fleets/{fleetId}/vehicles`
  * Détails du véhicule : `GET /v1/vehicles/{vehicleId}`
  * Créer un véhicule : `POST /v1/vehicles`
  * Mettre à jour un véhicule : `PATCH /v1/vehicles/{vehicleId}`
  * Paramètres opérationnels (vitesse, carburant, position) : `GET` et `PATCH /v1/vehicles/{vehicleId}/operational`
  * Supprimer un véhicule : `DELETE /v1/vehicles/{vehicleId}`
  * Attacher / Détacher d'une flotte : `POST /v1/fleets/{fleetId}/vehicles` et `DELETE /v1/fleets/{fleetId}/vehicles/{vehicleId}`
  * Galerie photo (Media) du véhicule : `GET /v1/vehicles/{vehicleId}/media`

* **Gestion des Conducteurs (Drivers)**
  * Liste de ses conducteurs : `GET /v1/drivers` ou `GET /v1/fleets/{fleetId}/drivers`
  * Créer un conducteur : `POST /v1/drivers/register` ou `POST /v1/fleets/{fleetId}/drivers/register`
  * Mettre à jour les informations : `PUT /v1/drivers/{driverId}`
  * Assigner un véhicule : `POST /v1/drivers/{driverId}/assign-vehicle`
  * Détacher d'une flotte : `DELETE /v1/fleets/{fleetId}/drivers/{driverId}`

* **Trajets, Maintenances et Incidents (Vue Superviseur)**
  * Consulter les trajets : `GET /v1/trips`
  * Consulter les incidents : `GET /v1/operations/incidents`
  * Mettre à jour le statut d'un incident : `PATCH /v1/operations/incidents/{incidentId}/status`
  * Consulter les maintenances : `GET /v1/maintenances`

---

## 4. Rôle : Conducteur (Driver)
Les endpoints appelés par le conducteur lors de l'utilisation de l'application sur le terrain.

* **Mes Trajets (Trips)**
  * Historique de mes trajets : `GET /v1/trips/my-history`
  * Voir mon trajet actif : `GET /v1/trips/my-active`
  * Démarrer un trajet : `PUT /v1/trips/{tripId}/start`
  * Terminer un trajet : `PUT /v1/trips/{tripId}/complete`
  * Annuler un trajet : `PUT /v1/trips/{tripId}/cancel`

* **Mes Signalements sur le Terrain**
  * Créer un incident (Accident, etc.) : `POST /v1/operations/incidents`
  * Consulter mes incidents déclarés : `GET /v1/operations/incidents/driver/{driverId}`
  * Déclarer une intervention (Maintenance / Plein) : `POST /v1/maintenances`
  * Consulter mes interventions : `GET /v1/maintenances`

* **Mes Véhicules**
  * Voir les détails de mon véhicule assigné : `GET /v1/vehicles/{vehicleId}`
