# Sehat Setu enhancement notes

## Added in this build
- Hospital and doctor search by doctor name, specialty, and common disease-to-specialty keywords.
- Doctor appointment request endpoint and patient-facing request form.
- Blood bank search with ABO/Rh inventory and component information.
- Pharmacy and medicine search with stock and prescription-required flags.
- Ambulance device GPS reporting endpoint and browser geolocation sharing screen.
- Emergency request capture with patient GPS coordinates and sample ambulance assignment.
- Health assistant with local emergency red-flag handling and optional OpenAI API integration.
- Added API tests for discovery, inventory, appointment, emergency, GPS and emergency assistant.

## Important limits
All provider profiles, availability, capacity, inventory, and dispatch assignment data are sample/demo data. This build does not connect to real hospitals, blood banks, pharmacies, ambulance operators, 112, or a verified clinical system. Production authentication, authorization, consent, security hardening, provider verification and clinical validation are still required.
