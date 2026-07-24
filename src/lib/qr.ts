import QRCode from "qrcode";

export function appUrl(path = "") {
  const base = process.env.APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function makeVerifyQrDataUrl(token: string) {
  const url = appUrl(`/verify/${token}`);
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 180,
    color: { dark: "#0f2744", light: "#ffffff" },
  });
}
