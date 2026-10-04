/**
 * Fonction pure de stabilisation d'un code-barres scanne.
 *
 * On ne declenche l'action (navigation / detection) qu'apres avoir lu `threshold`
 * fois de suite le meme code, afin d'eviter les faux positifs transitoires.
 *
 * @param {string|null} lastScanned - Dernier code vu
 * @param {number} scanCount        - Nombre de lectures identiques consecutives jusqu'ici
 * @param {string} code             - Nouveau code detecte
 * @param {number} threshold        - Nombre minimum de lectures consecutives requis
 * @returns {{ lastScanned: string, scanCount: number, navigate: boolean }}
 */
export function stabilizeBarcode (lastScanned, scanCount, code, threshold) {
  if (code === lastScanned) {
    const newCount = scanCount + 1
    return { lastScanned: code, scanCount: newCount, navigate: newCount >= threshold }
  } else {
    return { lastScanned: code, scanCount: 1, navigate: false }
  }
}
