            // v2.38 : registre des types du modèle. Chaque fichier du modèle y inscrit ses classes ;
            // le magasin (03-donnees) s'en sert pour recréer les objets sauvegardés, sans dépendre
            // directement des fichiers du modèle (plus de dépendance circulaire).
            var _impTypes = {};

