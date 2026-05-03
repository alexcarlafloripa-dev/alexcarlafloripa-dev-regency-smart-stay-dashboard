/**
 * driveService.ts — Salva arquivos no Google Drive
 *
 * Estrutura de pastas:
 *   {Imobiliária} / {Corretor} {Telefone} / Cota {cota} - {Investidor} / {arquivo}
 *
 * Método 1 (principal): Google Apps Script Web App
 *   - Funciona em dev e produção (não depende de token local)
 *   - URL: https://script.google.com/macros/s/.../exec
 *
 * Método 2 (fallback dev): rclone CLI
 *   - Apenas em desenvolvimento local
 *
 * Pasta raiz: ID 16Bi6L0A5Go8tuE0Z10z0g79kLTUho9fD
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, mkdtemp } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

const RESERVAS_FOLDER_ID = process.env.GOOGLE_DRIVE_RESERVAS_FOLDER_ID || "16Bi6L0A5Go8tuE0Z10z0g79kLTUho9fD";
const APPS_SCRIPT_URL =
  process.env.GOOGLE_DRIVE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbzsh8f5_IfqOseytCHjzP-U3WOfDVzdKCMMWmETeQhoq_UGjBDKVRu1kr8HgBwDLJw/exec";
const RCLONE_CONFIG = "/home/ubuntu/.gdrive-rclone.ini";
const RCLONE_REMOTE = `manus_google_drive,root_folder_id=${RESERVAS_FOLDER_ID}:`;

// ─── Helpers de nome ───────────────────────────────────────────────────────

function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[\/\\:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .substring(0, 80);
}

function toTitleCase(str: string): string {
  const trimmed = str.trim();
  if (/^aut[oô]nomo/i.test(trimmed)) return "Autonomo";
  return trimmed
    .toLowerCase()
    .replace(/(^|\s)(\S)/g, (_m, space, c) => space + c.toUpperCase());
}

function normalizeTelefone(tel: string): string {
  return tel.replace(/\D/g, "").substring(0, 13);
}

function corretorPastaName(nomeCorretor: string, telefoneCorretor: string): string {
  const nome = sanitizeName(nomeCorretor || "Corretor");
  const tel = normalizeTelefone(telefoneCorretor || "");
  return tel ? `${nome} Tel-${tel}` : nome;
}

function reservaPastaName(unitCota: string, nomeInvestidor: string): string {
  const cota = sanitizeName(unitCota || "SN");
  const inv = sanitizeName(nomeInvestidor || "Investidor");
  return `Cota ${cota} - ${inv}`;
}

// ─── Método 1: Apps Script (principal — funciona em dev e produção) ──────

async function uploadViaAppsScript(params: {
  folderPath: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<{ fileId: string; fileUrl: string }> {
  const base64Content = params.buffer.toString("base64");

  const payload = {
    action: "uploadFile",
    rootFolderId: RESERVAS_FOLDER_ID,
    parentFolderId: RESERVAS_FOLDER_ID,
    folderId: RESERVAS_FOLDER_ID,
    base64Content,
    filename: params.filename,
    mimeType: params.mimeType,
    folderPath: params.folderPath,
  };

  console.log(`[DriveService] Apps Script upload -> ${params.folderPath}/${params.filename}`);

  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  const text = await res.text();
  let data: { success: boolean; fileId?: string; fileUrl?: string; error?: string };

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Apps Script retornou resposta inválida (status ${res.status}): ${text.substring(0, 300)}`);
  }

  if (!data.success) {
    throw new Error(`Apps Script erro: ${data.error || "desconhecido"}`);
  }

  return { fileId: data.fileId || "", fileUrl: data.fileUrl || "" };
}

// ─── Método 2: rclone (fallback dev) ──────────────────────────────────────

async function uploadViaRclone(params: {
  filename: string;
  buffer: Buffer;
  folderPath: string;
}): Promise<void> {
  const tmpDir = await mkdtemp(join(tmpdir(), "drive-upload-"));
  const tmpFilePath = join(tmpDir, params.filename);

  try {
    await writeFile(tmpFilePath, params.buffer);
    const destination = `${RCLONE_REMOTE}${params.folderPath}/`;
    const cmd = `rclone copy "${tmpFilePath}" "${destination}" --config "${RCLONE_CONFIG}"`;
    console.log(`[DriveService] rclone copy -> ${params.folderPath}/${params.filename}`);

    const { stderr } = await execAsync(cmd, { timeout: 60000 });
    if (stderr && stderr.includes("ERROR")) {
      throw new Error(`rclone erro: ${stderr.substring(0, 300)}`);
    }
  } finally {
    try {
      await unlink(tmpFilePath);
      const { rmdir } = await import("fs/promises");
      await rmdir(tmpDir);
    } catch {
      // ignora erro de limpeza
    }
  }
}

// ─── Funções exportadas ────────────────────────────────────────────────────

/**
 * Salva um arquivo no Google Drive na estrutura:
 *   {Imobiliária} / {Corretor} {Telefone} / Cota {cota} - {Investidor} / {filename}
 *
 * Tenta primeiro via Apps Script (funciona em dev e produção).
 * Se falhar, tenta via rclone (fallback apenas em dev).
 */
export async function saveFileToDrive(params: {
  imobiliaria: string;
  nomeCorretor: string;
  telefoneCorretor: string;
  unitCota: string;
  nomeInvestidor: string;
  filename: string;
  buffer: Buffer;
  mimeType?: string;
}): Promise<{ path: string; ok: boolean }> {
  const {
    imobiliaria,
    nomeCorretor,
    telefoneCorretor,
    unitCota,
    nomeInvestidor,
    filename,
    buffer,
    mimeType = "application/octet-stream",
  } = params;

  const imobPasta = sanitizeName(toTitleCase(imobiliaria || "Imobiliaria"));
  const corretorPasta = corretorPastaName(nomeCorretor, telefoneCorretor);
  const reservaPasta = reservaPastaName(unitCota, nomeInvestidor);
  const folderPath = `${imobPasta}/${corretorPasta}/${reservaPasta}`;
  const drivePath = `${folderPath}/${filename}`;

  console.log(`[DriveService] Salvando: ${drivePath}`);

  // ── Tentativa 1: Apps Script (funciona em dev e produção) ─────────────
  try {
    const result = await uploadViaAppsScript({ folderPath, filename, buffer, mimeType });
    console.log(`[DriveService] ✅ Upload via Apps Script concluído: ${drivePath} (fileId: ${result.fileId})`);
    return { path: drivePath, ok: true };
  } catch (err) {
    console.warn(`[DriveService] ⚠️ Apps Script falhou: ${String(err).substring(0, 200)}`);
  }

  // ── Tentativa 2: rclone (fallback dev) ─────────────────────────────────
  try {
    await uploadViaRclone({ filename, buffer, folderPath });
    console.log(`[DriveService] ✅ Upload via rclone concluído: ${drivePath}`);
    return { path: drivePath, ok: true };
  } catch (err) {
    console.error(`[DriveService] ❌ Ambos os métodos falharam: ${String(err).substring(0, 300)}`);
    return { path: drivePath, ok: false };
  }
}

/**
 * Gera um link compartilhável para a pasta raiz de reservas no Drive.
 */
export async function getDriveFolderLink(_params: {
  imobiliaria: string;
  nomeCorretor: string;
  telefoneCorretor: string;
}): Promise<string | null> {
  return `https://drive.google.com/drive/folders/${RESERVAS_FOLDER_ID}`;
}
