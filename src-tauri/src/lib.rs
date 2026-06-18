#[tauri::command]
fn save_workspace_backup(filename: String, contents: String) -> Result<Option<String>, String> {
  let Some(path) = rfd::FileDialog::new()
    .add_filter("LESS NOTE backup", &["json"])
    .set_file_name(&filename)
    .save_file()
  else {
    return Ok(None);
  };

  std::fs::write(&path, contents).map_err(|error| format!("Failed to save backup: {error}"))?;

  Ok(Some(path.display().to_string()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![save_workspace_backup])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
