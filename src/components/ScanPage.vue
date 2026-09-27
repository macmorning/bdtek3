<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card>
          <v-card-title class="blue-grey lighten-1 white--text">
            <v-btn icon dark title="retour à la bibliothèque" class="mr-2" @click="$router.push('/')">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            Scanner un code barre
          </v-card-title>

          <v-alert
            v-if="cameraError"
            type="error"
            class="ma-3"
            outlined
          >
            {{ cameraError }}
          </v-alert>

          <scanner
            ref="scanner"
            :on-detected="onBarcodeDetected"
            :on-error="onCameraError"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
  name: 'ScanPage',

  components: {
    Scanner
  },

  data () {
    return {
      lastScanned: null,
      scanCount: 0,
      STABLE_THRESHOLD: 3,
      cameraError: null,
      navigating: false
    }
  },

  mounted () {
    // Filet de securite : couper la camera si l'onglet passe en arriere-plan
    // ou si la page est masquee (navigation arriere, changement d'app mobile).
    this._onHidden = () => {
      if (document.hidden) {
        this.stopScannerSafely()
      }
    }
    document.addEventListener('visibilitychange', this._onHidden)
    window.addEventListener('pagehide', this.stopScannerSafely)
  },

  // Hook Vue Router : plus fiable que beforeDestroy pour les changements de route
  beforeRouteLeave (to, from, next) {
    this.stopScannerSafely()
    next()
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

    onBarcodeDetected (payload) {
      // Ignorer les detections apres declenchement de la navigation
      if (this.navigating) return

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
        this.navigating = true
        // Arreter la camera AVANT de naviguer
        this.stopScannerSafely()
        this.$router.push('/scan/' + code)
      }
    },

    onCameraError (err) {
      const message = (err && err.message) ? err.message : String(err)
      this.cameraError = 'Impossible d\'acceder a la camera : ' + message
    }
  }
}
</script>
