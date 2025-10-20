# Plan de tests de performance et qualité web

## Objectifs

- Mesurer la résilience de l’API FastAPI face à des charges soutenues.
- Surveiller en continu la qualité Web (Core Web Vitals, SEO, accessibilité) du frontend Next.js.
- Détecter précocement les régressions de performance grâce à l’intégration CI/CD.

## Campagnes de charge (k6)

| Étape | Description | Détails |
| --- | --- | --- |
| 1. Scénarios | Définir 3 scripts k6 : `auth-login.js`, `content-browse.js`, `newsletter-subscribe.js`. | Chaque script cible les endpoints `/api/auth/login`, `/api/content/articles`, `/api/newsletter/subscribe` avec vérifications de statut et de latence. |
| 2. Seuils | Fixer des thresholds k6 (`http_req_duration{scenario:auth}` < 500 ms p95, taux d’erreurs < 1 %). | Les seuils seront versionnés dans `tests/perf/k6-thresholds.json`. |
| 3. Exécution locale | Script npm `perf:k6` invoquant `k6 run` sur chaque scénario avec option `--vus 50 --duration 5m`. | Permet une vérification ponctuelle avant merge. |
| 4. Intégration CI | Étape GitHub Actions hebdomadaire (cron) + déclenchement manuel. | Export des résultats vers les dashboards Grafana via Prometheus Remote Write. |
| 5. Analyse | Stockage des rapports (`.json`) dans un bucket S3/MinIO pour conserver l’historique. | Alertes déclenchées si un seuil est franchi (webhook Ops). |

## Audits Lighthouse continus

1. **Configuration** : utiliser `lighthouse-ci` (`@lhci/cli`) avec un budget de performance (score ≥ 90) et PWA (score ≥ 85).
2. **Automatisation** : ajouter une étape CI `npm run lhci:autorun` après le déploiement sur l’environnement de préproduction.
3. **Comparaison** : stocker les rapports HTML/JSON dans un artefact CI et tracer les tendances dans Grafana via l’import des métriques.
4. **Alertes** : configurer des seuils Grafana (score < 85) déclenchant une notification Slack via l’`alert_manager`.

## Prochaines actions

- [ ] Créer les scripts k6 et le dossier `tests/perf`.
- [ ] Ajouter les commandes `perf:k6` et `lhci:autorun` au `package.json`.
- [ ] Étendre la pipeline CI pour exécuter périodiquement k6 et Lighthouse.
- [ ] Documenter les procédures de triage des alertes dans le runbook SRE.
