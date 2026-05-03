/**
 * tokenRefresher.ts — Verifica a disponibilidade do token do Google Drive
 *
 * Em produção: GOOGLE_DRIVE_TOKEN é injetado e renovado automaticamente pelo Manus.
 * Em desenvolvimento: usa o token do rclone como fallback (renovado a cada 45 min).
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const RCLONE_CONFIG = "/home/ubuntu/.gdrive-rclone.ini";
const REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutos

/**
 * Renova o token do rclone (usado apenas em desenvolvimento local).
 */
async function refreshRcloneToken(): Promise<void> {
  try {
    await execAsync(
      `rclone lsd manus_google_drive: --config ${RCLONE_CONFIG} --max-depth 0`,
      { timeout: 30000 }
    );
    console.log(`[TokenRefresher] Token rclone renovado às ${new Date().toLocaleTimeString("pt-BR")}`);
  } catch {
    // Em produção, o rclone não existe — isso é esperado e não é um erro
  }
}

/**
 * Inicia o job de verificação do token.
 * Em produção, o GOOGLE_DRIVE_TOKEN é gerenciado automaticamente pelo Manus.
 * Em desenvolvimento, renova o token do rclone a cada 45 minutos como fallback.
 */
export function startTokenRefresher(): void {
  if (process.env.GOOGLE_DRIVE_TOKEN) {
    console.log("[TokenRefresher] Token do Google Drive disponível via variável de ambiente (produção)");
    return;
  }

  // Modo desenvolvimento: renova via rclone
  console.log("[TokenRefresher] Modo desenvolvimento — renovação automática a cada 45 minutos via rclone");
  refreshRcloneToken();

  const interval = setInterval(refreshRcloneToken, REFRESH_INTERVAL_MS);
  if (interval.unref) interval.unref();
}
