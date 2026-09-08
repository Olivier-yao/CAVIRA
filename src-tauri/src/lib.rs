#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use tauri::{
        menu::{Menu, MenuItem},
        tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
        Manager, WindowEvent,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:cavira.db", crate::migrations::all())
                .build(),
        )
        .setup(|app| {
            let afficher = MenuItem::with_id(app, "afficher", "Afficher CAVIRA", true, None::<&str>)?;
            let quitter = MenuItem::with_id(app, "quitter", "Quitter", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&afficher, &quitter])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("CAVIRA")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "afficher" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quitter" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                });
            }

            Ok(())
        })
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
            Migration {
                version: 11,
                description: "retrospectives",
                sql: include_str!("../migrations/011_retrospectives.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 12,
                description: "masque_projets",
                sql: include_str!("../migrations/012_masque_projets.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 13,
                description: "personnes_panneau",
                sql: include_str!("../migrations/013_personnes_panneau.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 14,
                description: "routines",
                sql: include_str!("../migrations/014_routines.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 15,
                description: "routine_notes",
                sql: include_str!("../migrations/015_routine_notes.sql"),
                kind: MigrationKind::Up,
            },
            Migration {
                version: 16,
                description: "finances_personnelles",
                sql: include_str!("../migrations/016_finances_personnelles.sql"),
                kind: MigrationKind::Up,
            },
        ]
    }
}
