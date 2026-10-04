<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-banner
        style="top:0px"
        sticky
        single-line
        class="blue-grey lighten-1 white--text"
      >
        <v-btn class="white--text" text title="fermer" @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        Scanner un code barre
      </v-banner>

      <v-alert
        v-if="cameraError"
        type="error"
        class="ma-3"
        outlined
      >
        {{ cameraError }}
      </v-alert>

      <scanner
        v-if="value"
        ref="scanner"
        :on-detected="onBarcodeDetected"
        :on-error="onCameraError"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import Scanner from '@/components/Scanner'

/**
 * Pure stabilisation function — exported for unit/property-based testing.
 *
 * Returns the new state and whether navigation should be triggered.
 *
 * @param {string|null} lastScanned - Last code that was seen
 * @param {number} scanCount        - Number of consecutive identical reads so far
 * @param {string} code             - Newly detected code
 * @param {number} threshold        - Minimum consecutive reads required to navigate
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

export default {
  name: 'ScanDialog',

  components: {
    Scanner
  },

  props: {
    // v-model : etat ouvert/ferme de la modale
    value: {
      type: Boolean,
      default: false
    }
  },

  emits: ['input', 'detected'],

  data () {
    return {
      lastScanned: null,
      scanCount: 0,
      STABLE_THRESHOLD: 3,
      cameraError: null,
      detecting: false
    }
  },

  watch: {
    value (open) {
      if (open) {
        // Reinitialiser l'etat de detection a chaque ouverture
        this.lastScanned = null
        this.scanCount = 0
        this.cameraError = null
        this.detecting = false
      } else {
        // Fermeture : couper la camera proprement
        this.stopScannerSafely()
      }
    }
  },

  mounted () {
    // Filet de securite : couper la camera si l'onglet passe en arriere-plan
    // ou si la page est masquee (changement d'app mobile, verrouillage).
    this._onHidden = () => {
      if (document.hidden) {
        this.stopScannerSafely()
      }
    }
    document.addEventListener('visibilitychange', this._onHidden)
    window.addEventListener('pagehide', this.stopScannerSafely)
  },

  // eslint-disable-next-line vue/no-deprecated-destroyed-lifecycle
  beforeDestroy () {
    this.stopScannerSafely()
    document.removeEventListener('visibilitychange', this._onHidden)
    window.removeEventListener('pagehide', this.stopScannerSafely)
  },

  methods: {
    stopScannerSafely () {
      if (this.$refs.scanner && typeof this.$refs.scanner.stop === 'function') {
        this.$refs.scanner.stop()
      }
    },

    closeDialog () {
      this.stopScannerSafely()
      this.$emit('input', false)
    },

    onBarcodeDetected (payload) {
      // Ignorer les detections une fois qu'un code stable a ete retenu
      if (this.detecting) return

      const code = payload.codeResult.code
      const result = stabilizeBarcode(
        this.lastScanned,
        this.scanCount,
        code,
        this.STABLE_THRESHOLD
      )
      this.lastScanned = result.lastScanned
      this.scanCount = result.scanCount

      if (result.navigate) {
        this.detecting = true
        // Arreter la camera AVANT de signaler la detection
        this.stopScannerSafely()
        this.$emit('input', false)
        this.$emit('detected', code)
      }
    },

    onCameraError (err) {
      const message = (err && err.message) ? err.message : String(err)
      this.cameraError = 'Impossible d\'acceder a la camera : ' + message
    }
  }
}
</script>
