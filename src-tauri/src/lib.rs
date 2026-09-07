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
        ]
    }
}
