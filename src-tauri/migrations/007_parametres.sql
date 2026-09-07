-- Couleurs de catégories exactes (lues sur l'écran Paramètres de la
-- maquette) ; les valeurs précédentes avaient été estimées avant d'avoir
-- accès à cet écran et étaient fausses (Dev app et Réel étaient inversés,
-- Autre n'était pas le gris neutre attendu).
UPDATE categories SET color = '#4FD1E8' WHERE id = 'cat-dev';
UPDATE categories SET color = '#F472A8' WHERE id = 'cat-jeu';
UPDATE categories SET color = '#B6E24A' WHERE id = 'cat-reel';
UPDATE categories SET color = '#8A90A6' WHERE id = 'cat-autre';
