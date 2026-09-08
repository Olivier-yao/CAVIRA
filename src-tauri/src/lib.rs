#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:cavira.db", crate::migrations::all())
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub mod migrations {
    use tauri_plugin_sql::{Migration, MigrationKind};

    pub fn all() -> Vec<Migration> {
        vec![
            Migration {
                version: 1,
                description: "init",
                sql: include_str!("../migrations/001_init.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 2,
                description: "seed",
                sql: include_str!("../migrations/002_seed.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 3,
                description: "fiche_projet",
                sql: include_str!("../migrations/003_fiche_projet.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 4,
                description: "objectifs_multiples",
                sql: include_str!("../migrations/004_objectifs_multiples.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 5,
                description: "backlog_idees",
                sql: include_str!("../migrations/005_backlog_idees.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 6,
                description: "notes_titre",
                sql: include_str!("../migrations/006_notes_titre.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 7,
                description: "parametres",
                sql: include_str!("../migrations/007_parametres.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 8,
                description: "archives",
                sql: include_str!("../migrations/008_archives.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 9,
                description: "liens_projets",
                sql: include_str!("../migrations/009_liens_projets.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 10,
                description: "importance_projets",
                sql: include_str!("../migrations/010_importance_projets.sql"),
                kind: MigrationKind::Up,
            },
        ]
    }
}
